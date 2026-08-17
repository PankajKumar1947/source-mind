import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/clients/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
    return new Response('Webhook secret is not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Processing Clerk Webhook: Event Type = ${eventType}, User ID = ${id}`);

  try {
    if (eventType === 'user.created') {
      const { email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return new Response('Missing primary email address in webhook payload', { status: 400 });
      }

      await prisma.user.create({
        data: {
          userId: id!,
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
        },
      });
      console.log(`User ${id} successfully created in database.`);
    }

    if (eventType === 'user.updated') {
      const { email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return new Response('Missing primary email address in webhook payload', { status: 400 });
      }

      await prisma.user.update({
        where: { userId: id! },
        data: {
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
        },
      });
      console.log(`User ${id} successfully updated in database.`);
    }

    if (eventType === 'user.deleted') {
      await prisma.user.delete({
        where: { userId: id! },
      });
      console.log(`User ${id} successfully deleted from database.`);
    }
  } catch (error) {
    console.error(`Database operation failed for event ${eventType}:`, error);
    return new Response('Database operation failed', { status: 500 });
  }

  return new Response('Webhook processed successfully', { status: 200 });
}

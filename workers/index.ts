import { indexingSourceWorker } from "./indexing.worker";
import { queryWorker } from "./query.worker";

console.log("Both Indexing and Query workers have started successfully.");

// Graceful shutdown to close both worker connections when server process stops
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down workers gracefully...`);
  try {
    await Promise.all([
      indexingSourceWorker.close(),
      queryWorker.close()
    ]);
    console.log("All workers closed successfully.");
  } catch (error) {
    console.error("Error closing workers during graceful shutdown:", error);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

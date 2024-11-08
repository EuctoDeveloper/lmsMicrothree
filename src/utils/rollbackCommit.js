import mongoose from "mongoose";
import logger from "../configs/loggers.js";

export default async function runWithTransaction(operation) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Run the provided operation within the transaction
      await operation(session);
  
      // Commit transaction if no errors
      await session.commitTransaction();
      logger.info('Transaction committed successfully');
    } catch (error) {
      // Abort the transaction in case of error
      await session.abortTransaction();
      logger.error('Transaction aborted due to error:', error);
      throw error; // Re-throw the error to handle it elsewhere
    } finally {
      session.endSession();
    }
  }
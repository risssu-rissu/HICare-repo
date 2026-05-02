import mongoose from 'mongoose';

const BpmReadingSchema = new mongoose.Schema(
  {
    avgBpm: {
      type: Number,
      required: true,
    },
    device_id: {
      type: String,
      default: 'esp32-pulse-1',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from creating the model multiple times in development
export default mongoose.models.BpmReading || mongoose.model('BpmReading', BpmReadingSchema);

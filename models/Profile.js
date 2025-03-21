import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    name: { type: String, default: "Unknown" },
    age: { type: Number, default: 0 },
    gender: { type: String, default: "Not specified" },
    location: { type: String, default: "Unknown" },
    height: { type: String, default: "N/A" },
    zodiacSign: { type: String, default: "N/A" },
    dmStatus: { type: String, default: "Closed" },
    verificationLevel: { type: String, default: "Unverified" },
    hobbies: { type: [String], default: [] },
    interests: { type: String, default: "None" },
    bio: { type: String, default: "No bio yet" },
    visibility: { type: String, enum: ["public", "private"], default: "public" }
});

export default mongoose.model('Profile', profileSchema);

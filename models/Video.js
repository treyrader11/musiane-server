const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        teacher: {
            type: String,
        },
        title: {
            type: String,
            required: true,
            minLength: 3, 
            maxLength: 100
        },
        isPending: {
            type: Boolean,
            default: true
        },
        thumbnailUrl: {
            type: String,
            // required: [true, 'Please add an image for thumbnail'],
            // default: 'https://i.ibb.co/4pDNDk1/avatar.png',
        },
        desc: {
            type: String,
            //required: true,
            minLength: 5,
            maxLength: 500,
            default: 'This is a placeholder description of this video.'
        },
        videoUrl: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
        likes: {
            type: [String],
            default: [],
        },
        dislikes: {
            type: [String],
            default: [],
        },
        genre: {
            type: String,
            //required: true,
            // default: []
        },
        duration: {
            type: Number,
            required: false
        },
    },
    { timestamps: true }    
  );

module.exports = mongoose.model("Video", VideoSchema);
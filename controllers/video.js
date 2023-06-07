const User = require("../models/User");
const Video = require("../models/Video");
const { StatusCodes } = require("http-status-codes");

console.clear();

const addVideo = async (req, res, next) => {
    console.log('addVideo req.body:', req.body);
    const newVideo = new Video({ userId: req.user.id, ...req.body });
    try {
        const savedVideo = await newVideo.save();
        res.status(StatusCodes.CREATED).json(savedVideo);
    } catch (err) {
        next(err);
    }
};

const updateVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return next(createError(404, "Video not found!"));
        if (req.user.id === video.userId) {
            const updatedVideo = await Video.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true }
            );
            res.status(200).json(updatedVideo);
        } else {
          return next(createError(403, "You can update only your video!"));
        }
    } catch (err) {
        next(err);
    }
};
  
const deleteVideo = async (req, res, next) => {
    console.log('inside of deleteVideo')
    console.log('req.params', req.params);
    //console.log('req.body', req.body)
    try {
        const video = await Video.findById(req.params.id);
        console.log('video:', video);
        if (!video) return next(createError(404, "Video not found!"));
        if (req.user && req.user.role === "admin") {
            const deletedVideo = await Video.findByIdAndDelete(req.params.id);
          res.status(200).json({
            message: `The video ${deletedVideo.title} was deleted successfully`,
            deletedVideo,
        });
        } else {
          return next(createError(403, "User doesn't have permission!"));
        }
    } catch (err) {
        next(err);
      }
};

// delete multiple videos
const deleteVideos = async (req, res) => {
    try {
        const ids = req.body.ids;
        //const { ids } = req.body;
        console.log('deleteVideo - req.body', req.body);

        if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Please provide an array of ids to delete.' });
        }

        if (ids.length === 1) {
        const id = ids[0];
        const video = await Video.findByIdAndDelete(id);
        if (!video) {
            return res.status(404).json({ error: `Could not find video with id ${id}` });
        }
        return res.json({ message: `The video "${video.title}" has been deleted.` });
        }

        const result = await Video.deleteMany({ _id: { $in: ids } });
        if (!result || result.deletedCount === 0) {
        return res.status(404).json({ error: 'Could not delete videos with the provided ids.' });
        }

        return res.json({ message: `Videos with ids ${ids} have been deleted.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get video
const getVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        res.status(200).json(video);
    } catch (err) {
        next(err);
    }
};

// add a video view
const addView = async (req, res, next) => {
    try {
        await Video.findByIdAndUpdate(req.params.id, {
          $inc: { views: 1 },
        });
        res.status(200).json("The view has been increased.");
    } catch (err) {
        next(err);
    }
};

//get trending videos
const trend = async (req, res, next) => {
    try {
        const videos = await Video.find().sort({ views: -1 });
        console.log('trending videos:', videos)
        res.status(200).json(videos);
    } catch (err) {
        next(err);
    }
};

//get all videos. should be sorted by random
const all = async (req, res, next) => {
    console.log('Inside of "all" controller. req.body:', req.body);
    try {
        const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
        console.log('random videos:', videos)
        res.status(StatusCodes.OK).json(videos);
    } catch (err) {
        next(err);
    }
};

//get subscribers
const sub = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const subscribedChannels = user.subscribedUsers;
    
        const list = await Promise.all(
          subscribedChannels.map(async (channelId) => {
            return await Video.find({ userId: channelId });
          })
        );
    
        res.status(200).json(list.flat().sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
        next(err);
    }
};

//get videos by tags
const getByTag = async (req, res, next) => {
    const tags = req.query.tags.split(",");
    try {
        const videos = await Video.find({ tags: { $in: tags } }).limit(20);
        res.status(200).json(videos);
    } catch (err) {
        next(err);
    }
};

//get videos by search
const search = async (req, res, next) => {
    const query = req.query.q;
    try {
        const videos = await Video.find({
            title: { $regex: query, $options: "i" },
        }).limit(40);
        res.status(200).json(videos);
    } catch (err) {
        next(err);
    } 
};

module.exports = {
    addVideo,
    updateVideo,
    deleteVideo,
    deleteVideos,
    getVideo,
    addView,
    trend,
    all,
    sub,
    getByTag,
    search
};
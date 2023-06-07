const express = require("express");
const { 
    addVideo,
    updateVideo,
    deleteVideo,
    //deleteVideos,
    getVideo,
    addView,
    trend,
    all,
    sub,
    getByTag,
    search 
} = require("../controllers/video");
const authorize = require("../middleware/authorization");
const router = express.Router();

router.post("/", authorize, addVideo);
router.put("/:id", authorize, updateVideo);
router.delete("/:id", authorize, deleteVideo);
//router.delete("/", authorize, adminOnly, videoController.deleteVideos);
router.get("/find/:id", getVideo);
router.put("/view/:id", addView);
router.get("/trend", trend);
router.get("/all", all);
router.get("/sub", authorize, sub);
router.get("/tags", getByTag);
router.get("/search", search);

module.exports = router;

import express from "express";
import mockMasterDataRouter from "../modules/mockMasterData/mockMasterData.routes.js";
import mockV1Router from "../modules/mockV1/mockV1.routes.js";

const router = express.Router();

router.get("/health", (req, res) => {
    res.json({
        data: {
            status: "ok",
            data_source: "mock"
        },
        meta: {},
        errors: []
    });
});

router.use("/v1", mockV1Router);
router.use("/", mockMasterDataRouter);

export default router;

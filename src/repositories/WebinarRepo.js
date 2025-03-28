import moment from "moment-timezone";
import Webinar from "../models/WebinarModel.js";
const WebinarRepo = {
    getWebinars: async (cond, userId) => {
        console.log("WebinarRepo -> getWebinars -> cond", cond)
        console.log({invitees: {$in: [userId]}})
        const webinars = await Webinar.aggregate([
            { $match: {$and: [
                cond,
                {invitees: { $elemMatch: { $eq: userId } }}
            ]}},
            { $sort: { webinarDate: 1 } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, webinars: { $push: "$$ROOT" } } },
        ]);
        console.log("WebinarRepo -> getWebinars -> webinars", webinars)
        return webinars;
    },
    getWebinarById: async (id) => {
        return await Webinar.findOne({ webinarId: id });
    },
    getUpcomingWebinar: async (userId) => {

        const now = moment().utc();
        const webinars = await Webinar.find({ invitees: { $elemMatch: { $eq: userId } },
            isActive: true,
            $or: [
                { date: { $gt: now.toDate() } },
                {
                    date: { $eq: now.startOf('day').toDate() },
                    time: { $gt: now.format('HH:mm') }
                }
            ]
        }).sort({ date: 1, time: 1 });
        return webinars[0];
    }
}

export default WebinarRepo;
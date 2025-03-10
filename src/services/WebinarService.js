import WebinarRepo from "../repositories/WebinarRepo.js";

const WebinarService = {
    getMyWebinars: async (userId, date, date2) => {
        if(!date) {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            date = startOfMonth;
        }
        return await WebinarRepo.getWebinars({date:{ $gte: new Date(date), $lte: new Date(date2) }}, userId);
    },
    getWebinarById: async (id) => {
        return await WebinarRepo.getWebinarById(id);
    },
    getUpcomingWebinar: async (userId) => {
        return await WebinarRepo.getUpcomingWebinar(userId);
    }

};

export default WebinarService;
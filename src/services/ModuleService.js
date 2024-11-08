import Module from "../models/ModuleModel.js";
import ModuleProgress from "../models/ModuleProgressModel.js";

const ModuleService = {
    getModules: async (courseId) => {
        const modules = await Module.find({ course: courseId });
        return modules;
    },
    enrollUser: async (enrollmentId, modules, session) => {
        const moduleData = modules.map((module) => {
            return {
                enrollmentId: enrollmentId,
                moduleId: module.moduleId,
            };
        });
        console.log(moduleData)
        return ModuleProgress.create(moduleData, { session });
    }
};
export default ModuleService;
const BaseService = require(".");
const EventModel = require("../models/event");


class eventService extends BaseService{
    constructor(req, res, reqQuery) {
        super();
        this.req = req;
        this.res = res;
        this.reqQuery = reqQuery;
    }

    async addEvent(companyId) {
        const { event, startDate, endDate, event_user_id, leave_type, leave_description, leave_status  } = this.req;
    
        const dbEvent = new EventModel({
            event,
            startDate,
            endDate,
            event_user_id,
            leave_type,
            leave_description,
            leave_status,
            company_id: companyId,
        });
    
        await dbEvent.save();
        return dbEvent._id;
    }
    
    async deleteEvent(id){
        const deletedEvent =  await EventModel.findByIdAndUpdate(id, {deleted_at: new Date()}, {new: true })

        return deletedEvent;
    }

    async updateEvent(eventId) {
        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            { $set: this.req, updated_at: new Date() },
            { new: true }
        );

        return updatedEvent;
    }
}

module.exports = eventService
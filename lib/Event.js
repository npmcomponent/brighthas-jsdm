function Event(name,data){

	this._data = {
		name : name,
		data : data,
		aggreType : null,
		aggreId : null,
		time : new Date()
	}

}

Event.prototype = {

    get aggreType(){return this._data.aggreType},
    get aggreId(){return this._data.aggreId},
    get time(){return this._data.time},
    get name(){return this._data.name},
    get data(){return this._data.data}

}

module.exports = Event;
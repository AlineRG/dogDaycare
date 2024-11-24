const mongoose = require("mongoose");
const schemaObj = {
    name: {type: String, required: true},
    breed: {type: String, required: true}
}
const mongooseSchema = mongoose.Schema(schemaObj);
module.exports = mongoose.model("Pets", mongooseSchema);
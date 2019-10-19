const mongoose = require('mongoose')
const schema = mongoose.Schema;


//schema for geolocation

const GeoSchema = new schema({
  type:{
    type: String,
    default:"Point"
  },
  coordinates: {
    type:[Number],
    index:"2dsphere"
  }
})

const userSchema = new schema({
  username: String,
  password: String,
  first_name: String,
  last_name:String,
  email: String,
  phone_number: Number,
  zip_code:Number,
  profile_photo: String,
  stripeId:String,
  reviews: [
    {
      poster_id:String,
      poster_first_name: String,
      poster_last_name: String,
      review: String
    }
  ],
  stripe:[{
    _id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
    customer_id: String,
    subscription_id: String
  }],
  applicants: [{
    _id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
    applicant_id: String,
    applicant_job_title:String,
    applicant_first_name: String,
    applicant_last_name: String
  }],
  postedJobs:[{
    _id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
    poster_id:String,
    name:String,
    job_title: String,
    category: String,
    description: String,
    location: String,
    due_date: String,
    time: String,
    price: Number,
    images: [String],
    completed: String
  }],
  completedJobs:[{
    _id: String,
    poster_id:String,
    name:String,
    job_title: String,
    category: String,
    description: String,
    location: String,
    due_date: String,
    time: String,
    price: Number,
    images: [String],
    completed: String
  }],
  appliedJobs:[{
    _id: String,
    poster_id:String,
    name:String,
    job_title: String,
    category: String,
    description: String,
    location: String,
    due_date: String,
    time: String,
    price: Number,
    images: [String],
    completed: String
  }],
geometry:GeoSchema
})

module.exports = mongoose.model('user',userSchema,'users')

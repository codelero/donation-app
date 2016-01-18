'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    unique: true,
    required: 'Title cannot be blank'
  },
  description: {
    type: String,
    default: '',
    trim: true,
    required: 'Description cannot be blank'
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    trim: true,
    required: 'Category cannot be blank'
  },
  amount: {
    type: Number,
    trim: true,
    default: '',
    required: 'Amount cannot be blank'

  },
  appeal: Boolean,
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

ProjectSchema.pre('save', function (next) {
  // Generate slug based on title
  // TODO: make conversion more robust
  this.slug = this.title.replace(/\s+/g, '-').toLowerCase();
  next();
});

mongoose.model('Project', ProjectSchema);


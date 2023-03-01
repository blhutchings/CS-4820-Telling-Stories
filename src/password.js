
/**
 * modular dependcies
 */
const express = require("express")
const router = express.Router()
const db = require("./config/database")


/**
 * working code, handles requests to root route /password, handles both 'forgot-password' and 'reset-password'
 * renamed to 'forgot' and 'reset' respectivly 
 */
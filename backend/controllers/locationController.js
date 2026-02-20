// ================================================
// LOCATION CONTROLLER
// File: controllers/locationController.js
// Handle business logic untuk office locations
// ================================================

const OfficeLocation = require('../models/OfficeLocation');

// PENJELASAN:
// Controller simpel untuk get data office locations
// Nanti mobile app bisa ambil list locations
// Dan user pilih mau absen di lokasi mana

// ================================================
// GET ALL LOCATIONS
// GET /api/locations
// ================================================
const getAll = async (req, res) => {
    try {
        const locations = await OfficeLocation.getAll();
        
        return res.status(200).json({
            success: true,
            data: locations,
            total: locations.length
        });
        
    } catch (error) {
        console.error('Error in getAll locations:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get locations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ================================================
// GET LOCATION BY ID
// GET /api/locations/:id
// ================================================
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const location = await OfficeLocation.findById(id);
        
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: location
        });
        
    } catch (error) {
        console.error('Error in getById location:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get location',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAll,
    getById
};
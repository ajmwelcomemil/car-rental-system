const Vehicle = require('../models/Vehicle');

exports.getAllVehicles = async (req, res) => {
  try {
    const { type, fuelType, minPrice, maxPrice, sort, availability } = req.query;

    // Initialize filter object
    const filter = {};
    
    // Filter by Type (SUV, Sedan, Hatchback)
    if (type) {
      filter.type = { $in: type.split(',') };  // Allow multiple types to be passed as comma-separated values
    }

    // Filter by Fuel Type (Petrol, Diesel, Electric)
    if (fuelType) {
      filter.fuelType = { $in: fuelType.split(',') }; // Allow multiple fuel types to be passed as comma-separated values
    }

    // Filter by Availability (Available, Booked)
    if (availability !== undefined) {
      filter.availability = availability === 'true'; // Filter availability (true/false)
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      filter.pricePerDay = {
        ...(minPrice && { $gte: minPrice }),  // Greater than or equal to minPrice
        ...(maxPrice && { $lte: maxPrice })   // Less than or equal to maxPrice
      };
    }

    // Query to find vehicles with the applied filters
    let query = Vehicle.find(filter);

    // Sort by price or creation date
    if (sort === 'price-asc') {
      query = query.sort({ pricePerDay: 1 });  // Sort by ascending price
    } else if (sort === 'price-desc') {
      query = query.sort({ pricePerDay: -1 }); // Sort by descending price
    } else {
      query = query.sort({ createdAt: -1 });   // Default to sort by creation date (newest first)
    }

    // Execute the query
    const vehicles = await query;
    res.json(vehicles); // Return the filtered and sorted vehicles
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

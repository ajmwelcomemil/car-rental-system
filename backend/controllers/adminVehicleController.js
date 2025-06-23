const Vehicle = require('../models/Vehicle');
// add vehicle
exports.addVehicle = async (req, res) => {
  try {
    const { name, brand, type, fuelType, pricePerDay, tags } = req.body;
    const images = req.files?.map(file => file.filename) || [];

    const newVehicle = new Vehicle({
      name, brand, type, fuelType, pricePerDay,
      tags: tags ? tags.split(',') : [],
      images
    });

    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added', vehicle: newVehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//edit vehicle
exports.editVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const updates = req.body;
    if (req.files?.length) {
      updates.images = req.files.map(file => file.filename);
    }
    if (updates.tags) {
      updates.tags = updates.tags.split(',');
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Vehicle updated', vehicle: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    vehicle.availability = !vehicle.availability;
    await vehicle.save();

    res.json({ message: 'Availability toggled', availability: vehicle.availability });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
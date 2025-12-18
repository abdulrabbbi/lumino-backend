import Badge from '../Models/Badge.js'

export const createBadge = async (req, res) => {
    try {
      const { name, description, category } = req.body
  
      if (!name || !description || !category || !req.file) {
        return res.status(400).json({ message: "All fields and image are required" })
      }
  
      const icon = req.file.path 
  
      const badge = new Badge({
        name,
        description,
        icon,
        category
      })
  
      await badge.save()
      res.status(201).json({ message: "Badge created successfully", badge })
    } catch (error) {
        console.error('Create Badge Error:', error)
        res.status(500).json({ message: "Server Error", error: error.message })
      }
      
  }

export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.status(200).json(badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBadge = await Badge.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedBadge) {
      return res.status(404).json({ message: "Badge not found" });
    }

    res.status(200).json({ message: "Badge updated", badge: updatedBadge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Badge.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Badge not found" });
    }

    res.status(200).json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

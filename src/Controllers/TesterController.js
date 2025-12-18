import TesterForm from "../Models/TesterForm.js";
import User from "../Models/User.js";

export const submitTesterForm = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      firstName,
      lastName,
      email,
      childFirstName,
      childAge,
      moreChildrenInfo,
      experienceBackground,
      tellMoreAboutExperience,
      whyWantToBecomeTester,
      timePerWeek
    } = req.body;

    const testerForm = new TesterForm({
      user: userId,
      firstName,
      lastName,
      email,
      childFirstName,
      childAge,
      moreChildrenInfo,
      experienceBackground,
      tellMoreAboutExperience,
      whyWantToBecomeTester,
      timePerWeek
    });
    await testerForm.save();

    await User.findByIdAndUpdate(userId, { isTestFamily: true });

    res.status(201).json({ message: "Form submitted successfully! You're now a test family.", testerForm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

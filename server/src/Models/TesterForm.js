import mongoose from 'mongoose';

const testerFormSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },

  childFirstName: { type: String, required: true },
  childAge: { type: String, required: true },
  moreChildrenInfo: { type: String },

  experienceBackground: { 
    type: String, 
    enum: [
      "Yes, I Am A Professional Teacher, Child Coach, Pedagogue, Etc!",
      "NO, But I Am Very Interested In Child Development",
      "No, No Specific Background"
    ], 
    required: true 
  },
  tellMoreAboutExperience: { type: String },
  whyWantToBecomeTester: { type: String, required: true },
  timePerWeek: { type: String, required: true },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TesterForm', testerFormSchema);

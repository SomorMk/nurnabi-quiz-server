const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const config = require("../src/config/index");
const User = require("../src/modules/user/user.model");
const Category = require("../src/modules/category/category.model");
const Level = require("../src/modules/level/level.model");
const Schedule = require("../src/modules/schedule/schedule.model");
const Question = require("../src/modules/question/question.model");
const Settings = require("../src/modules/setting/setting.model");
const LevelQuizSubmissionHistory = require("../src/modules/levelQuizSubmissionHistory/levelQuizSubmissionHistory.model");
const SubmissionHistory = require("../src/modules/submissionHistory/submissionHistory.model");

const seed = async () => {
  try {
    await mongoose.connect(config.DB_URL);
    console.log("Database connected");

    // Clear old data (order matters: dependents first)
    await LevelQuizSubmissionHistory.deleteMany({});
    await SubmissionHistory.deleteMany({});
    await Question.deleteMany({});
    await Level.deleteMany({});
    await Schedule.deleteMany({});
    await Category.deleteMany({});
    await Settings.deleteMany({});
    console.log(
      "Cleared old database (categories, levels, schedules, questions, submissions, settings)"
    );

    // Ensure admin user exists
    const adminExists = await User.findOne({ role: "super_admin" });
    if (!adminExists) {
      await User.create({
        fullName: "Super Admin",
        phone: "+1234567890",
        email: "admin@quiz.com",
        password: "admin123",
        role: "super_admin",
      });
      console.log("Created super_admin user: admin@quiz.com / admin123");
    } else {
      console.log("Super admin already exists");
    }

    // Default settings
    await Settings.create({
      privacyPolicy: "This is the privacy policy placeholder.",
      aboutUs: "About the Quiz application.",
      support: "Contact support at support@quiz.com",
      termsOfService: "Terms of service placeholder.",
    });
    console.log("Created default settings");

    // Categories
    const [catGeneral, catScience, catHistory] = await Category.insertMany([
      {
        name: "General Knowledge",
        description: "Test your general knowledge",
        priority: 1,
      },
      {
        name: "Science",
        description: "Science and technology questions",
        priority: 2,
      },
      { name: "History", description: "World and local history", priority: 3 },
    ]);
    console.log("Created categories");

    // Levels (per category)
    const level1 = await Level.create({
      category: catGeneral._id,
      name: "General Easy",
      numberOfQuestion: 5,
      perQuestionMark: 2,
      negativeAnswerMark: 0,
      priority: 1,
    });
    const level2 = await Level.create({
      category: catGeneral._id,
      name: "General Medium",
      numberOfQuestion: 5,
      perQuestionMark: 3,
      negativeAnswerMark: 1,
      priority: 2,
    });
    const level3 = await Level.create({
      category: catScience._id,
      name: "Science Basics",
      numberOfQuestion: 5,
      perQuestionMark: 2,
      negativeAnswerMark: 0,
      priority: 1,
    });
    console.log("Created levels");

    // Schedule (live quiz)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    const schedule = await Schedule.create({
      name: "Weekly General Quiz",
      description: "A weekly quiz on general knowledge",
      startTime,
      endTime,
      numberOfQuestion: 3,
      perQuestionMark: 5,
      negativeAnswerMark: 1,
      requirePoint: 0,
      status: "active",
    });
    console.log("Created schedule");

    // Questions for Level (General Easy)
    const levelQuestions = [
      {
        model_type: "Level",
        model_id: level1._id,
        title: "What is the capital of France?",
        option1: "London",
        option2: "Paris",
        option3: "Berlin",
        option4: "Madrid",
        correctAnswer: "Paris",
        priority: 1,
      },
      {
        model_type: "Level",
        model_id: level1._id,
        title: "How many continents are there?",
        option1: "5",
        option2: "6",
        option3: "7",
        option4: "8",
        correctAnswer: "7",
        priority: 2,
      },
      {
        model_type: "Level",
        model_id: level1._id,
        title: "Which planet is known as the Red Planet?",
        option1: "Venus",
        option2: "Mars",
        option3: "Jupiter",
        option4: "Saturn",
        correctAnswer: "Mars",
        priority: 3,
      },
      {
        model_type: "Level",
        model_id: level1._id,
        title: "What is 2 + 2?",
        option1: "3",
        option2: "4",
        option3: "5",
        option4: "6",
        correctAnswer: "4",
        priority: 4,
      },
      {
        model_type: "Level",
        model_id: level1._id,
        title: "Which is the largest ocean?",
        option1: "Atlantic",
        option2: "Indian",
        option3: "Arctic",
        option4: "Pacific",
        correctAnswer: "Pacific",
        priority: 5,
      },
    ];

    // Questions for General Medium
    const level2Questions = [
      {
        model_type: "Level",
        model_id: level2._id,
        title: "In which year did World War II end?",
        option1: "1943",
        option2: "1944",
        option3: "1945",
        option4: "1946",
        correctAnswer: "1945",
        priority: 1,
      },
      {
        model_type: "Level",
        model_id: level2._id,
        title: "Who wrote 'Romeo and Juliet'?",
        option1: "Charles Dickens",
        option2: "William Shakespeare",
        option3: "Jane Austen",
        option4: "Mark Twain",
        correctAnswer: "William Shakespeare",
        priority: 2,
      },
      {
        model_type: "Level",
        model_id: level2._id,
        title: "What is the chemical symbol for gold?",
        option1: "Go",
        option2: "Gd",
        option3: "Au",
        option4: "Ag",
        correctAnswer: "Au",
        priority: 3,
      },
      {
        model_type: "Level",
        model_id: level2._id,
        title: "Which country is home to the kangaroo?",
        option1: "New Zealand",
        option2: "Australia",
        option3: "South Africa",
        option4: "India",
        correctAnswer: "Australia",
        priority: 4,
      },
      {
        model_type: "Level",
        model_id: level2._id,
        title: "How many sides does a hexagon have?",
        option1: "5",
        option2: "6",
        option3: "7",
        option4: "8",
        correctAnswer: "6",
        priority: 5,
      },
    ];

    // Questions for Science Basics
    const level3Questions = [
      {
        model_type: "Level",
        model_id: level3._id,
        title: "What is the chemical formula for water?",
        option1: "CO2",
        option2: "H2O",
        option3: "NaCl",
        option4: "O2",
        correctAnswer: "H2O",
        priority: 1,
      },
      {
        model_type: "Level",
        model_id: level3._id,
        title: "What force keeps us on the ground?",
        option1: "Magnetism",
        option2: "Gravity",
        option3: "Friction",
        option4: "Tension",
        correctAnswer: "Gravity",
        priority: 2,
      },
      {
        model_type: "Level",
        model_id: level3._id,
        title: "What is the speed of light (approximately)?",
        option1: "300,000 km/s",
        option2: "150,000 km/s",
        option3: "500,000 km/s",
        option4: "100,000 km/s",
        correctAnswer: "300,000 km/s",
        priority: 3,
      },
      {
        model_type: "Level",
        model_id: level3._id,
        title: "Which organ pumps blood through the body?",
        option1: "Lungs",
        option2: "Liver",
        option3: "Heart",
        option4: "Kidney",
        correctAnswer: "Heart",
        priority: 4,
      },
      {
        model_type: "Level",
        model_id: level3._id,
        title: "What is the smallest unit of life?",
        option1: "Atom",
        option2: "Cell",
        option3: "Molecule",
        option4: "Tissue",
        correctAnswer: "Cell",
        priority: 5,
      },
    ];

    // Schedule (live) questions
    const scheduleQuestions = [
      {
        model_type: "Schedule",
        model_id: schedule._id,
        title: "What is the largest mammal?",
        option1: "Elephant",
        option2: "Blue Whale",
        option3: "Giraffe",
        option4: "Hippo",
        correctAnswer: "Blue Whale",
        priority: 1,
      },
      {
        model_type: "Schedule",
        model_id: schedule._id,
        title: "Which gas do plants absorb from the air?",
        option1: "Oxygen",
        option2: "Nitrogen",
        option3: "Carbon Dioxide",
        option4: "Hydrogen",
        correctAnswer: "Carbon Dioxide",
        priority: 2,
      },
      {
        model_type: "Schedule",
        model_id: schedule._id,
        title: "How many bones are in the adult human body?",
        option1: "186",
        option2: "206",
        option3: "226",
        option4: "246",
        correctAnswer: "206",
        priority: 3,
      },
    ];

    await Question.insertMany([
      ...levelQuestions,
      ...level2Questions,
      ...level3Questions,
      ...scheduleQuestions,
    ]);
    console.log("Created questions");

    // Update level/schedule question counts
    await Level.updateOne(
      { _id: level1._id },
      { $set: { numberOfQuestion: levelQuestions.length } }
    );
    await Level.updateOne(
      { _id: level2._id },
      { $set: { numberOfQuestion: level2Questions.length } }
    );
    await Level.updateOne(
      { _id: level3._id },
      { $set: { numberOfQuestion: level3Questions.length } }
    );
    await Schedule.updateOne(
      { _id: schedule._id },
      { $set: { numberOfQuestion: scheduleQuestions.length } }
    );

    console.log("Seed completed successfully");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();

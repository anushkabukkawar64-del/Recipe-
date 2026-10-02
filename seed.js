const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Rating = require('./models/Rating');

const seedDatabase = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipe_haven';
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Rating.deleteMany({});
    console.log('🧹 Cleared existing database records.');

    // Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const userChloe = await User.create({
      name: 'Chef Chloe',
      email: 'chloe@recipehaven.com',
      password: passwordHash,
    });

    const userOliver = await User.create({
      name: 'Oliver Vance',
      email: 'oliver@recipehaven.com',
      password: passwordHash,
    });

    const userMia = await User.create({
      name: 'Mia Sterling',
      email: 'mia@recipehaven.com',
      password: passwordHash,
    });

    console.log('👤 Created demo users: chloe@recipehaven.com, oliver@recipehaven.com, mia@recipehaven.com (password: password123)');

    // Create Demo Recipes
    const recipe1 = await Recipe.create({
      title: 'Fluffy Golden Berry Soufflé Pancakes',
      description:
        'Decadent, melt-in-your-mouth cloud pancakes topped with fresh organic strawberries, ripe blueberries, cream butter, and golden maple syrup.',
      ingredients: [
        '2 large free-range eggs (separated into yolks & whites)',
        '2 tbsp whole milk or buttermilk',
        '1 tsp vanilla bean paste',
        '33g all-purpose flour',
        '1/2 tsp baking powder',
        '23g fine cane sugar',
        'Fresh strawberries & blueberries for garnish',
        '1 tbsp unsalted organic butter',
        'Pure grade-A maple syrup',
      ],
      steps: [
        'Whisk egg yolks, milk, and vanilla extract together in a bowl until frothy.',
        'Sift the flour and baking powder into the yolk mixture. Whisk gently until smooth.',
        'In a clean glass bowl, whip egg whites with an electric mixer, gradually adding sugar until stiff glossy peaks form.',
        'Gently fold 1/3 of the meringue into the batter, then fold the remainder without deflating.',
        'Preheat a non-stick pan over very low heat with a drop of oil. Spoon tall mounds of batter onto the pan.',
        'Add a splash of water to the pan and cover with lid to steam for 4-5 minutes.',
        'Carefully flip and steam for another 3 minutes until golden and springy.',
        'Stack tall, top with butter, fresh berries, and warm maple syrup. Serve immediately!',
      ],
      imagePath: '/uploads/berry_pancakes.jpg',
      category: 'Breakfast',
      prepTime: '25 mins',
      servings: '2 servings',
      user: userChloe._id,
    });

    const recipe2 = await Recipe.create({
      title: 'Creamy Basil Pesto Tagliatelle with Cherry Tomatoes',
      description:
        'Silky handmade tagliatelle tossed in fragrant genovese basil pesto, toasted pine nuts, sweet charred cherry tomatoes, and aged parmigiano-reggiano.',
      ingredients: [
        '350g fresh tagliatelle or fettuccine pasta',
        '2 cups fresh basil leaves (firmly packed)',
        '1/3 cup toasted Mediterranean pine nuts',
        '1/2 cup extra virgin olive oil',
        '1/2 cup freshly grated Parmigiano-Reggiano',
        '2 cloves fresh garlic',
        '1 cup baby heirloom cherry tomatoes (halved)',
        '1/4 cup heavy cream or pasta cooking water',
        'Flaky sea salt & freshly cracked black pepper',
      ],
      steps: [
        'Toast pine nuts in a dry skillet over medium heat for 3 minutes until golden and fragrant.',
        'In a food processor, pulse basil, garlic, toasted pine nuts, and salt until coarsely chopped.',
        'With the motor running, slowly drizzle in the extra virgin olive oil until emulsified.',
        'Transfer pesto to a bowl and stir in grated Parmigiano cheese and a touch of cream.',
        'Boil a large pot of salted water. Cook tagliatelle until al dente (approx 3 minutes for fresh pasta). Reserve 1/2 cup pasta water.',
        'In a wide skillet, lightly blister cherry tomatoes in olive oil for 2 minutes.',
        'Toss hot pasta with pesto sauce, blistered tomatoes, and a splash of reserved cooking water until glossy and silky.',
        'Serve in warm bowls garnished with fresh basil leaves, extra pine nuts, and shaved cheese.',
      ],
      imagePath: '/uploads/creamy_pesto_pasta.jpg',
      category: 'Dinner',
      prepTime: '20 mins',
      servings: '4 servings',
      user: userOliver._id,
    });

    const recipe3 = await Recipe.create({
      title: 'Aesthetic Iced Strawberry Matcha Latte',
      description:
        'A refreshing, layered artisanal café drink made with homemade sweet strawberry reduction, oat milk, and ceremonial-grade Japanese Uji matcha.',
      ingredients: [
        '1 tsp ceremonial-grade Japanese matcha powder',
        '60ml warm water (80°C / 175°F)',
        '1/2 cup fresh strawberries (hulled & finely diced)',
        '1 tbsp pure maple syrup or agave',
        '1 cup creamy barista oat milk or whole milk',
        'Handful of clear ice cubes',
        'Fresh strawberry slice & mint sprig for garnish',
      ],
      steps: [
        'In a small bowl, muddle diced strawberries with maple syrup until jammy and juicy.',
        'Sift matcha powder into a chawan or bowl, add 80°C warm water, and whisk in a "W" motion with a bamboo whisk until velvety foam appears.',
        'Spoon the strawberry compote into the base of a tall transparent glass.',
        'Fill the glass three-quarters full with fresh ice cubes.',
        'Slowly pour cold oat milk over the ice to create a crisp white middle layer.',
        'Gently pour whisked matcha on top over the back of a spoon to create the distinct vibrant green top layer.',
        'Garnish the rim with a fresh strawberry slice and enjoy with a bamboo straw!',
      ],
      imagePath: '/uploads/strawberry_matcha.jpg',
      category: 'Drinks',
      prepTime: '10 mins',
      servings: '1 serving',
      user: userChloe._id,
    });

    const recipe4 = await Recipe.create({
      title: 'Gourmet Avocado Toast with Jammy Soft-Boiled Egg',
      description:
        'Thick toasted artisan sourdough slathered with lemon-zested smashed Hass avocado, heirloom radishes, everything bagel seasoning, and a 6-minute jammy egg.',
      ingredients: [
        '2 thick slices rustic sourdough artisan bread',
        '1 large ripe Hass avocado',
        '1 organic free-range egg',
        '1/2 lemon (juiced & zested)',
        '3 heirloom radishes (thinly mandolined)',
        'Handful fresh microgreens or pea shoots',
        '1 tsp everything bagel seasoning (or toasted sesame seeds)',
        'Extra virgin olive oil & chili flakes to finish',
      ],
      steps: [
        'Bring a small pot of water to a gentle boil. Lower egg into water and boil for exactly 6 minutes and 30 seconds.',
        'Transfer egg immediately to an ice bath for 3 minutes to stop cooking. Peel gently.',
        'Toast sourdough slices in a toaster or on a hot cast iron skillet with olive oil until deeply golden and crunchy.',
        'In a small bowl, coarsely mash avocado with lemon juice, zest, flaky sea salt, and black pepper.',
        'Spread the mashed avocado generously over warm sourdough slices.',
        'Slice the soft-boiled egg in half to reveal the rich, jammy golden yolk. Rest on top of the avocado.',
        'Garnish with radishes, microgreens, everything bagel seasoning, and a drizzle of olive oil.',
      ],
      imagePath: '/uploads/avocado_toast.jpg',
      category: 'Breakfast',
      prepTime: '15 mins',
      servings: '1-2 servings',
      user: userMia._id,
    });

    console.log('🥘 Created 4 aesthetic recipes with rich steps & ingredients.');

    // Create Initial Ratings to demonstrate dynamic rating calculation
    await Rating.create([
      { recipe: recipe1._id, user: userOliver._id, value: 5 },
      { recipe: recipe1._id, user: userMia._id, value: 5 },
      { recipe: recipe2._id, user: userChloe._id, value: 5 },
      { recipe: recipe2._id, user: userMia._id, value: 4 },
      { recipe: recipe3._id, user: userOliver._id, value: 5 },
      { recipe: recipe4._id, user: userChloe._id, value: 5 },
      { recipe: recipe4._id, user: userOliver._id, value: 4 },
    ]);

    console.log('⭐ Seeded initial ratings.');
    console.log('✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

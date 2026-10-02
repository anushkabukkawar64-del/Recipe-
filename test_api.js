const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5005/api';

const runTests = async () => {
  console.log('🧪 Starting Full-Stack Recipe Haven API Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await axios.get('http://localhost:5005/api/health');
    assert(healthRes.data.status === 'ok', 'API Health Check is OK');

    // 2. User Registration
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Chef Tester',
      email: testEmail,
      password: 'password123',
    });
    assert(regRes.data.success && regRes.data.token, 'User Registration with JWT token');
    const userToken = regRes.data.token;
    const userId = regRes.data.user._id;

    // 3. User Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'password123',
    });
    assert(loginRes.data.success && loginRes.data.token === userToken, 'User Login & Token Generation');

    // 4. Authenticated Profile
    const profileRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(profileRes.data.user.email === testEmail, 'Fetch Authenticated User Profile (authMiddleware)');

    // 5. Create Recipe with Image (Multipart Form-Data)
    const form = new FormData();
    form.append('title', 'Lemon Blueberry Ricotta Scones');
    form.append('description', 'Tender, flaky scones bursting with fresh juicy blueberries and zesty lemon.');
    form.append('category', 'Breakfast');
    form.append('prepTime', '35 mins');
    form.append('servings', '8 scones');
    form.append('ingredients', JSON.stringify([
      '2 cups all-purpose flour',
      '1/2 cup fresh ricotta cheese',
      '1 cup fresh blueberries',
      'Zest of 1 Meyer lemon'
    ]));
    form.append('steps', JSON.stringify([
      'Whisk dry ingredients and cut in cold butter.',
      'Fold in ricotta and blueberries gently.',
      'Shape into a disc, slice into wedges, and bake at 400F for 18 minutes.'
    ]));

    // Sample image file
    const sampleImagePath = path.join(__dirname, 'uploads/berry_pancakes.jpg');
    if (fs.existsSync(sampleImagePath)) {
      form.append('image', fs.createReadStream(sampleImagePath));
    }

    const createRes = await axios.post(`${BASE_URL}/recipes`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${userToken}`,
      },
    });
    assert(createRes.data.success && createRes.data.recipe._id, 'Create Recipe with Image Upload (Multer)');
    const createdRecipeId = createRes.data.recipe._id;

    // 6. Get All Recipes
    const allRes = await axios.get(`${BASE_URL}/recipes`);
    assert(allRes.data.success && allRes.data.recipes.length > 0, `Get All Recipes (Count: ${allRes.data.recipes.length})`);

    // 7. Search Recipes
    const searchRes = await axios.get(`${BASE_URL}/recipes?search=Lemon`);
    assert(searchRes.data.recipes.some(r => r.title.includes('Lemon')), 'Search Recipes by Title');

    // 8. Get Single Recipe Details
    const detailsRes = await axios.get(`${BASE_URL}/recipes/${createdRecipeId}`);
    assert(detailsRes.data.success && detailsRes.data.recipe.title === 'Lemon Blueberry Ricotta Scones', 'Get Single Recipe Details');

    // 9. Login as Second User to Rate Recipe
    const secondEmail = `rater_${Date.now()}@example.com`;
    const raterReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Food Critic Sam',
      email: secondEmail,
      password: 'password123',
    });
    const raterToken = raterReg.data.token;

    // 10. Submit Rating
    const rateRes = await axios.post(
      `${BASE_URL}/recipes/${createdRecipeId}/rate`,
      { value: 5 },
      { headers: { Authorization: `Bearer ${raterToken}` } }
    );
    assert(rateRes.data.success && rateRes.data.stats.averageRating === 5, 'Submit 5-Star Rating');

    // 11. Prevent Duplicate Rating Check
    try {
      await axios.post(
        `${BASE_URL}/recipes/${createdRecipeId}/rate`,
        { value: 4 },
        { headers: { Authorization: `Bearer ${raterToken}` } }
      );
      assert(false, 'Duplicate Rating Prevention (should have failed)');
    } catch (dupErr) {
      assert(
        dupErr.response && dupErr.response.status === 400,
        `Duplicate Rating Blocked with 400: "${dupErr.response?.data?.message}"`
      );
    }

    // 12. Dynamic Average Rating Aggregation Endpoint
    const avgRes = await axios.get(`${BASE_URL}/recipes/${createdRecipeId}/average-rating`);
    assert(avgRes.data.averageRating === 5 && avgRes.data.totalRatings === 1, 'Dynamic Average Rating via MongoDB Aggregation');

    // 13. Unauthorized Edit Attempt by Non-Owner
    try {
      await axios.put(
        `${BASE_URL}/recipes/${createdRecipeId}`,
        { title: 'Hacked Title' },
        { headers: { Authorization: `Bearer ${raterToken}` } }
      );
      assert(false, 'Unauthorized Edit Attempt (should have failed with 403)');
    } catch (authErr) {
      assert(
        authErr.response && authErr.response.status === 403,
        `Ownership Middleware Protection: "${authErr.response?.data?.message}"`
      );
    }

    // 14. Authorized Edit by Recipe Owner
    const editRes = await axios.put(
      `${BASE_URL}/recipes/${createdRecipeId}`,
      { title: 'Lemon Blueberry Ricotta Scones (Glazed)' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert(
      editRes.data.success && editRes.data.recipe.title.includes('Glazed'),
      'Recipe Edit by Owner (ownershipMiddleware)'
    );

    // 15. Get My Recipes
    const myRecipesRes = await axios.get(`${BASE_URL}/recipes/my-recipes`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      myRecipesRes.data.recipes.some(r => r._id === createdRecipeId),
      'Get My Recipes for Authenticated User'
    );

    // 16. Delete Recipe by Owner
    const deleteRes = await axios.delete(`${BASE_URL}/recipes/${createdRecipeId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(deleteRes.data.success, 'Delete Recipe & Associated Ratings');

    // 17. Verify Deleted
    try {
      await axios.get(`${BASE_URL}/recipes/${createdRecipeId}`);
      assert(false, 'Recipe should no longer exist after deletion');
    } catch (notFoundErr) {
      assert(notFoundErr.response && notFoundErr.response.status === 404, 'Verified Recipe Deletion (404 Not Found)');
    }

    console.log(`\n🎉 Verification Suite Completed: ${passed} Passed, ${failed} Failed.`);
  } catch (error) {
    console.error('Test Suite encountered an unexpected error:', error.response?.data || error.message);
  }
};

runTests();

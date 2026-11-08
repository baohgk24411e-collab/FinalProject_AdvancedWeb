// js/nutrition.js

// State variables
let userGoal = "";
let userActivity = 3; // 1-5 scale (matches ACTIVITY_MULTIPLIERS array index 0-4)
let userTime = "";
let userGender = "male";
let userAge = 25;
let userWeight = 60;
let userHeight = 165;
let userDiet = "omnivore";
let userServings = 1;
let excludedIngredients = [];
let currentStep = 1;
const TOTAL_STEPS = 5;

// Activity multipliers (Harris-Benedict TDEE)
const ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9];
const ACTIVITY_LABELS_VI = ["Ngủ, nghỉ", "Nhẹ nhàng", "Vừa phải", "Tích cực", "Cường độ cao"];
const ACTIVITY_LABELS_EN = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extremely Active"];


// Recipe database matching user criteria
const RECIPE_DATABASE = {
  "gain-muscle": {
    nameVi: "Sinh Tố Bơ Chuối Hạt Dinh Dưỡng Đậm Đặc",
    nameEn: "Avocado Banana Protein Power Smoothie",
    descVi: "Công thức phối trộn đặc biệt giàu calo tốt và đạm thực vật cao cấp từ bơ sáp Đắk Lắk dẻo ngậy, chuối Laba dồi dào kali và mix hạt dinh dưỡng cao cấp, cung cấp năng lượng tối đa xây dựng cơ bắp săn chắc sau tập luyện.",
    descEn: "A high-calorie protein builder combining rich organic avocados, potassium-dense Laba bananas, and premium nuts to deliver clean fuel and speed up muscle repair post-workout.",
    calories: { 1: 580, 2: 650, 3: 720 },
    macros: { protein: "22g", carbs: "65g", fat: "20g", fiber: "9g" },
    macroPcts: { protein: 20, carbs: 50, fat: 30 },
    ingredients: [
      { id: 6, name: "Bơ sáp Đắk Lắk", qtyVi: "1/2 quả (khoảng 150g)", qtyEn: "1/2 piece (approx. 150g)", roleVi: "Béo tốt và bùi dẻo", roleEn: "Healthy fats & creaminess" },
      { id: 44, name: "Chuối Laba Đà Lạt", qtyVi: "1 quả", qtyEn: "1 piece", roleVi: "Cấp Carbs nhanh & Kali", roleEn: "Fast carbs & Potassium" },
      { id: 45, name: "Mix Hạt Dinh Dưỡng 5 loại", qtyVi: "30g (giã nhuyễn)", qtyEn: "30g (crushed)", roleVi: "Đạm thực vật & Omega-3", roleEn: "Plant protein & Omega-3" }
    ],
    prepVi: [
      "Cho bơ sáp lột vỏ và chuối cắt lát vào máy xay sinh tố.",
      "Thêm 150ml sữa hạnh nhân hoặc sữa tươi không đường.",
      "Xay nhuyễn mịn trong 1 phút.",
      "Rót ra ly, rắc hạt dinh dưỡng mix giã nhỏ lên trên và thưởng thức."
    ],
    prepEn: [
      "Add peeled avocado and sliced banana to the blender.",
      "Pour in 150ml of unsweetened almond milk or fresh milk.",
      "Blend until smooth for about 1 minute.",
      "Pour into a glass, top with crushed mixed nuts and enjoy."
    ],
    alternative: {
      "avocado": { id: 46, name: "Hạt điều Bình Phước rang củi mộc", replacementVi: "Thay thế quả Bơ bằng hạt điều sấy béo ngậy để bù chất béo và đạm lành mạnh.", replacementEn: "Substituted Avocado with creamy Cashews to maintain healthy fats." }
    }
  },
  "lose-fat": {
    nameVi: "Sinh Tố Bát Dưa Lưới & Ổi Ruby Thải Độc",
    nameEn: "Golden Melon & Ruby Guava Detox Smoothie Bowl",
    descVi: "Sự kết hợp hoàn hảo ít calo nhưng cực nhiều vitamin C và nước từ dưa lưới Hoàng Kim giòn ngọt và ổi Ruby không hạt ruột hồng giàu chất xơ, giúp kích thích tiêu hóa, kiểm soát cảm giác thèm ăn hiệu quả.",
    descEn: "A calorie-controlled, fiber-rich detox recipe loaded with antioxidants and high hydration from sweet golden melons and seedless ruby guavas to support metabolic rate.",
    calories: { 1: 320, 2: 380, 3: 440 },
    macros: { protein: "12g", carbs: "52g", fat: "6g", fiber: "11g" },
    macroPcts: { protein: 15, carbs: 65, fat: 20 },
    ingredients: [
      { id: 5, name: "Dưa lưới Hoàng Kim", qtyVi: "150g (cắt khối vuông)", qtyEn: "150g (cubed)", roleVi: "Cấp nước & vitamin A", roleEn: "Hydration & Vitamin A" },
      { id: 3, name: "Ổi Ruby không hạt", qtyVi: "100g (ép lấy nước hoặc cắt nhỏ)", qtyEn: "100g (juiced or chopped)", roleVi: "Siêu giàu Vitamin C & chất xơ", roleEn: "Ultra Vitamin C & fiber" },
      { id: 2, name: "Cam xoàn Lai Vung", qtyVi: "1/2 quả (vắt nước)", qtyEn: "1/2 piece (juiced)", roleVi: "Vị ngọt thanh tự nhiên & vitamin", roleEn: "Natural sweetness & immunity" }
    ],
    prepVi: [
      "Ép nước ổi Ruby và vắt nước cam xoàn Lai Vung.",
      "Cho dưa lưới Hoàng Kim cắt lạnh vào máy xay cùng nước ép trên.",
      "Có thể thêm 1 thìa hạt chia hữu cơ (nếu có) để tăng chất xơ nở trong dạ dày.",
      "Xay nhuyễn rồi đổ ra bát tô, ăn lạnh trực tiếp bằng thìa."
    ],
    prepEn: [
      "Extract juice from Ruby Guava and squeeze Lai Vung Orange.",
      "Add chilled Golden Melon cubes into blender along with the juices.",
      "Optionally add 1 tbsp of organic chia seeds for extra fiber density.",
      "Blend and pour into a bowl, enjoy chilled with a spoon."
    ],
    alternative: {
      "melon": { id: 8, name: "Dưa hấu không hạt Mặt Trời", replacementVi: "Thay thế Dưa lưới bằng dưa hấu không hạt mọng nước thải độc.", replacementEn: "Substituted Melon with seedless watermelon for high hydration." }
    }
  },
  "eat-clean": {
    nameVi: "Sinh Tố Tropical Skin-Glow Đẹp Da Trẻ Hóa",
    nameEn: "Anti-Aging Tropical Skin-Glow Vitamin Smoothie",
    descVi: "Thức uống chứa hàm lượng beta-carotene và polyphenol cực cao từ xoài cát Hòa Lộc chín mọng phối trộn với thanh long ruột đỏ giàu anthocyanin, nuôi dưỡng tế bào da sáng mịn từ sâu bên trong, chống lão hóa tối ưu.",
    descEn: "A skin-nourishing cocktail loaded with beta-carotene from sweet mangoes and anti-aging anthocyanin from red dragon fruits, designed to promote collagen synthesis.",
    calories: { 1: 400, 2: 450, 3: 500 },
    macros: { protein: "14g", carbs: "56g", fat: "8g", fiber: "7g" },
    macroPcts: { protein: 15, carbs: 60, fat: 25 },
    ingredients: [
      { id: 1, name: "Xoài cát Hòa Lộc", qtyVi: "100g cùi xoài chín", qtyEn: "100g ripe mango flesh", roleVi: "Độ ngọt lịm & Vitamin E, A", roleEn: "Rich flavor & Vitamins A, E" },
      { id: 19, name: "Thanh long ruột tím hồng", qtyVi: "100g quả tươi", qtyEn: "100g fresh fruit", roleVi: "Chống oxy hóa & mát da", roleEn: "Antioxidants & skin cooling" },
      { id: 2, name: "Cam xoàn Lai Vung", qtyVi: "1/2 quả vắt nước", qtyEn: "1/2 piece juiced", roleVi: "Bổ sung Vitamin C dồi dào", roleEn: "Vitamin C booster" }
    ],
    prepVi: [
      "Cắt xoài cát Hòa Lộc và thanh long thành miếng nhỏ.",
      "Cho tất cả trái cây vào cối cùng nước cam xoàn và 50ml sữa chua không đường.",
      "Xay nhuyễn mịn với vài viên đá lạnh.",
      "Rút ra cốc và trang trí bằng lát xoài chín thơm lừng."
    ],
    prepEn: [
      "Cut Hoa Loc mango and dragon fruit into small pieces.",
      "Add fruits to blender container with orange juice and 50ml unsweetened yogurt.",
      "Blend until smooth with a few ice cubes.",
      "Pour into a tall glass and garnish with a fresh mango slice."
    ],
    alternative: {
      "mango": { id: 5, name: "Dưa lưới Hoàng Kim", replacementVi: "Thay thế Xoài cát bằng Dưa lưới Hoàng Kim thanh mát ít ngọt hơn.", replacementEn: "Substituted Mango with Golden Melon for lighter glycemic index." }
    }
  },
  "brain-focus": {
    nameVi: "Meal Prep Granola & Hạt Dinh Dưỡng Bổ Não",
    nameEn: "Mind-Focus Granola & Walnut Brain Power Bowl",
    descVi: "Chén thức ăn sáng/phụ đẳng cấp kết hợp yến mạch slow-carbs nướng giòn từ Granola Tứ Quý và omega-3 thực vật bổ não từ mix hạt (đặc biệt hạt óc chó), giúp tăng tuần hoàn máu não, tăng độ tập trung tinh thần trong công việc.",
    descEn: "A breakfast prep combining slow-release complex carbs from whole grain granola with organic neuro-supporting Omega-3 from walnuts to prevent brain fog.",
    calories: { 1: 460, 2: 520, 3: 580 },
    macros: { protein: "18g", carbs: "50g", fat: "16g", fiber: "10g" },
    macroPcts: { protein: 20, carbs: 50, fat: 30 },
    ingredients: [
      { id: 47, name: "Granola hạt & trái cây tự nhiên", qtyVi: "40g", qtyEn: "40g", roleVi: "Yến mạch & trái cây khô bổ sung xơ", roleEn: "Whole grain oats & fiber energy" },
      { id: 45, name: "Mix Hạt Dinh Dưỡng 5 loại", qtyVi: "25g", qtyEn: "25g", roleVi: "Quả óc chó & hạnh nhân bổ não", roleEn: "Walnuts & Almonds brain health" },
      { id: 44, name: "Chuối Laba Đà Lạt", qtyVi: "1 quả cắt lát", qtyEn: "1 piece sliced", roleVi: "Carbohydrate sạch bổ trợ cơ", roleEn: "Potassium & clean fuel carbs" }
    ],
    prepVi: [
      "Rót 100ml sữa chua hoặc sữa tươi hạt không đường vào chén sâu lòng.",
      "Trút Granola hạt trái cây tự nhiên và chuối Laba cắt lát lên trên.",
      "Rắc hạt óc chó và hạnh nhân băm nhỏ từ gói Mix hạt dinh dưỡng lên trên cùng.",
      "Có thể rưới thêm 1 thìa mật ong nguyên chất để bổ sung năng lượng tức thì."
    ],
    prepEn: [
      "Pour 100ml of plant yogurt or cold unsweetened milk into a bowl.",
      "Top with natural grains granola and sliced Laba bananas.",
      "Sprinkle chopped walnuts and almonds from the premium seed mix package.",
      "Optionally drizzle 1 tsp of pure honey for a fast organic glucose booster."
    ],
    alternative: {
      "walnut": { id: 46, name: "Hạt điều Bình Phước rang củi mộc", replacementVi: "Thay thế Óc chó bằng hạt điều Bình Phước bùi béo dồi dào magie chống stress.", replacementEn: "Substituted Walnuts with local Cashews rich in magnesium to combat stress." }
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const currentLang = localStorage.getItem("tqg_lang") || "vi";
  document.body.className = "lang-" + currentLang;
  updateProgressBar();
  updateBMIPreview();
});

// ─── STEP SELECTORS ───────────────────────────────────────────────────────────

window.selectGoal = function(goal, element) {
  userGoal = goal;
  const cards = element.parentElement.querySelectorAll(".option-card");
  cards.forEach(c => c.classList.remove("selected"));
  element.classList.add("selected");
  setTimeout(() => { goNext(); }, 350);
};

window.selectGender = function(gender, element) {
  userGender = gender;
  document.querySelectorAll("#gender-male, #gender-female").forEach(c => c.classList.remove("selected"));
  element.classList.add("selected");
  updateBMIPreview();
};

window.selectDiet = function(diet, element) {
  userDiet = diet;
  // Highlight only in parent container
  const siblings = element.parentElement.querySelectorAll(".option-card");
  siblings.forEach(c => c.classList.remove("selected"));
  element.classList.add("selected");
};

window.selectServings = function(n, element) {
  userServings = n;
  document.querySelectorAll("#srv-1, #srv-2, #srv-3").forEach(c => c.classList.remove("selected"));
  element.classList.add("selected");
};

window.selectTime = function(time, element) {
  userTime = time;
  const cards = element.parentElement.querySelectorAll(".option-card");
  cards.forEach(c => c.classList.remove("selected"));
  element.classList.add("selected");
};

window.updateActivityLabel = function(val) {
  userActivity = parseInt(val);
  const label = document.getElementById("label-activity-val");
  const isEn = document.body.classList.contains("lang-en");
  const idx = userActivity - 1;
  label.innerHTML = isEn
    ? `<span class="lang-en">${ACTIVITY_LABELS_EN[idx]}</span>`
    : `<span class="lang-vi">${ACTIVITY_LABELS_VI[idx]}</span>`;
};

window.toggleAllergen = function(item, element) {
  element.classList.toggle("selected");
  if (element.classList.contains("selected")) {
    if (!excludedIngredients.includes(item)) excludedIngredients.push(item);
  } else {
    excludedIngredients = excludedIngredients.filter(x => x !== item);
  }
};

// ─── BMI + TDEE CALCULATOR ───────────────────────────────────────────────────

window.updateBMIPreview = function() {
  const w = parseFloat(document.getElementById("input-weight")?.value) || userWeight;
  const h = parseFloat(document.getElementById("input-height")?.value) || userHeight;
  const a = parseFloat(document.getElementById("input-age")?.value) || userAge;
  userWeight = w; userHeight = h; userAge = a;

  const heightM = h / 100;
  const bmi = w / (heightM * heightM);
  const bmiRounded = bmi.toFixed(1);

  const isEn = document.body.classList.contains("lang-en");

  // BMI category
  let catVi, catEn, catColor;
  if (bmi < 18.5)        { catVi = "Thiếu cân";    catEn = "Underweight"; catColor = "#3b82f6"; }
  else if (bmi < 23)     { catVi = "Bình thường";  catEn = "Normal";      catColor = "#22c55e"; }
  else if (bmi < 27.5)   { catVi = "Thừa cân";     catEn = "Overweight";  catColor = "#f59e0b"; }
  else                   { catVi = "Béo phì";       catEn = "Obese";       catColor = "#ef4444"; }

  // Harris-Benedict BMR
  const actIdx = (userActivity - 1);
  const mult = ACTIVITY_MULTIPLIERS[actIdx] || 1.55;
  let bmr;
  if (userGender === "male") {
    bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
  } else {
    bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
  }
  const tdee = Math.round(bmr * mult);

  // Update preview elements
  const bmiEl = document.getElementById("bmi-value");
  const catEl = document.getElementById("bmi-category");
  const tdeeEl = document.getElementById("tdee-preview");

  if (bmiEl) { bmiEl.textContent = bmiRounded; bmiEl.style.color = catColor; }
  if (catEl) { catEl.textContent = isEn ? catEn : catVi; catEl.style.color = catColor; }
  if (tdeeEl) tdeeEl.textContent = tdee.toLocaleString() + " kcal";

  // Store for result page
  window._computedBmi = bmiRounded;
  window._computedBmiCatVi = catVi;
  window._computedBmiCatEn = catEn;
  window._computedTdee = tdee;
};

// ─── STEP NAVIGATION ─────────────────────────────────────────────────────────

window.goNext = function() {
  const isEn = document.body.classList.contains("lang-en");

  // Validation
  if (currentStep === 1 && !userGoal) {
    window.showToast(isEn ? "Please select a health goal!" : "Vui lòng chọn mục tiêu sức khỏe!", "error");
    return;
  }
  if (currentStep === 5 && !userTime) {
    window.showToast(isEn ? "Please select a meal timing!" : "Vui lòng chọn thời điểm sử dụng bữa ăn!", "error");
    return;
  }

  if (currentStep < TOTAL_STEPS) {
    document.getElementById(`quiz-step-${currentStep}`).classList.remove("active");
    currentStep++;
    document.getElementById(`quiz-step-${currentStep}`).classList.add("active");

    const backBtn = document.getElementById("btn-back");
    if (backBtn) backBtn.style.visibility = "visible";

    const nextBtn = document.getElementById("btn-next");
    if (nextBtn && currentStep === TOTAL_STEPS) {
      nextBtn.innerHTML = isEn
        ? '<span class="lang-en">🎉 Get My Plan</span>'
        : '<span class="lang-vi">🎉 Tạo Kế Hoạch Của Tôi</span>';
    }

    updateProgressBar();
  } else {
    generateNutritionPlan();
  }
};

window.goBack = function() {
  const isEn = document.body.classList.contains("lang-en");
  if (currentStep > 1) {
    document.getElementById(`quiz-step-${currentStep}`).classList.remove("active");
    currentStep--;
    document.getElementById(`quiz-step-${currentStep}`).classList.add("active");

    const backBtn = document.getElementById("btn-back");
    if (backBtn && currentStep === 1) backBtn.style.visibility = "hidden";

    const nextBtn = document.getElementById("btn-next");
    if (nextBtn) {
      nextBtn.innerHTML = isEn
        ? '<span class="lang-en">Next →</span>'
        : '<span class="lang-vi">Tiếp tục →</span>';
    }

    updateProgressBar();
  }
};

function updateProgressBar() {
  const fill = document.getElementById("progress-fill");
  if (fill) {
    const pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    fill.style.width = pct + "%";
  }
  const nodes = document.querySelectorAll(".quiz-step-node");
  nodes.forEach(n => {
    const step = parseInt(n.getAttribute("data-step"));
    n.className = "quiz-step-node";
    if (step === currentStep) n.classList.add("active");
    else if (step < currentStep) n.classList.add("completed");
  });
}


// GENERATE RECOMMENDATION RESULTS

let activeRecipeIngredients = [];

function generateNutritionPlan() {
  const isEn = document.body.classList.contains("lang-en");
  const recipe = RECIPE_DATABASE[userGoal];
  if (!recipe) return;

  // 1. Hide quiz wizard, show results dashboard
  document.getElementById("quiz-form-area").style.display = "none";
  document.querySelector(".quiz-progress-bar").style.display = "none";
  document.getElementById("results-root").classList.add("active");

  // 2. Populate BMI/TDEE result bar
  const bmi = window._computedBmi || "--";
  const tdee = window._computedTdee || 1800;
  const bmiCat = isEn ? (window._computedBmiCatEn || "") : (window._computedBmiCatVi || "");
  const resultBmiVal = document.getElementById("result-bmi-val");
  const resultBmiCat = document.getElementById("result-bmi-cat");
  const resultTdee = document.getElementById("result-tdee-val");
  if (resultBmiVal) resultBmiVal.textContent = bmi;
  if (resultBmiCat) resultBmiCat.textContent = bmiCat;
  if (resultTdee) resultTdee.textContent = tdee.toLocaleString();

  // 3. Set caloric target adjusted for goal
  const actIdx = Math.max(0, userActivity - 1);
  const baseCalories = recipe.calories[Math.min(actIdx + 1, 3)] || recipe.calories[2];
  document.getElementById("macro-calories").innerText = `${baseCalories.toLocaleString()}`;

  // 3b. Set goal icon + text in results banner
  const goalMeta = {
    'gain-muscle': { icon: '💪', vi: 'Tăng cơ & Bồi bổ', en: 'Gain Muscle' },
    'lose-fat':    { icon: '🔥', vi: 'Giảm mỡ',          en: 'Lose Fat' },
    'eat-clean':   { icon: '🍃', vi: 'Eat Clean & Đẹp da', en: 'Eat Clean' },
    'brain-focus': { icon: '🧠', vi: 'Tập trung trí não',  en: 'Brain Focus' }
  };
  const gm = goalMeta[userGoal] || { icon: '🎯', vi: '--', en: '--' };
  const goalIconEl = document.getElementById('result-goal-icon');
  const goalTxtEl = document.getElementById('result-goal-txt');
  if (goalIconEl) goalIconEl.textContent = gm.icon;
  if (goalTxtEl) goalTxtEl.textContent = isEn ? gm.en : gm.vi;

  // 3. Render SVG Dashboards
  animateSvgMacros(recipe.macroPcts);

  // 4. Exclusions / Ingredient Alternates calculation
  let finalIngredients = JSON.parse(JSON.stringify(recipe.ingredients)); // deep clone
  let alertHtml = "";

  excludedIngredients.forEach(excluded => {
    // If recipe has an alternative for this excluded category
    if (recipe.alternative && recipe.alternative[excluded]) {
      const alt = recipe.alternative[excluded];
      
      // Find the index of the ingredient to swap
      let swapIndex = -1;
      if (excluded === "avocado") {
        swapIndex = finalIngredients.findIndex(i => i.id === 6);
      } else if (excluded === "mango") {
        swapIndex = finalIngredients.findIndex(i => i.id === 1);
      } else if (excluded === "melon") {
        swapIndex = finalIngredients.findIndex(i => i.id === 5);
      } else if (excluded === "walnut") {
        swapIndex = finalIngredients.findIndex(i => i.id === 45); // Mix nuts contains walnut
      }

      if (swapIndex !== -1) {
        // Replace it
        finalIngredients[swapIndex] = {
          id: alt.id,
          name: alt.name,
          qtyVi: "30g sấy giòn",
          qtyEn: "30g toasted",
          roleVi: alt.replacementVi,
          roleEn: alt.replacementEn,
          isAlternate: true
        };

        alertHtml += `
          <div style="background:#FFF3CD; border:1px solid #FFEBAA; border-radius:8px; padding:10px 15px; color:#856404; font-size:12.5px; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
            ⚠️ <strong>${isEn ? 'Allergy Swap:' : 'Bộ lọc Dị ứng:'}</strong> 
            <span>${isEn ? alt.replacementEn : alt.replacementVi}</span>
          </div>
        `;
      }
    }
  });

  // Keep track of final IDs to add to cart
  activeRecipeIngredients = finalIngredients.map(i => i.id);

  // 5. Render details to HTML
  document.getElementById("rec-title").innerText = isEn ? recipe.nameEn : recipe.nameVi;
  document.getElementById("rec-desc").innerText = isEn ? recipe.descEn : recipe.descVi;
  
  document.getElementById("rec-protein").innerText = isEn ? `Protein: ${recipe.macros.protein}` : `Đạm: ${recipe.macros.protein}`;
  document.getElementById("rec-carbs").innerText = isEn ? `Carbs: ${recipe.macros.carbs}` : `Carbs: ${recipe.macros.carbs}`;
  document.getElementById("rec-fat").innerText = isEn ? `Fats: ${recipe.macros.fat}` : `Chất béo: ${recipe.macros.fat}`;
  document.getElementById("rec-fiber").innerText = isEn ? `Fiber: ${recipe.macros.fiber}` : `Chất xơ: ${recipe.macros.fiber}`;

  // Update SVG inside-circle label
  const ratioLabel = document.getElementById("macro-ratio-label");
  if (ratioLabel) {
    ratioLabel.textContent = isEn ? "Macros Ratio" : "Tỷ lệ Dinh dưỡng";
  }

  // Build ingredients table
  const table = document.getElementById("ingredients-table-body");
  let tableRows = `
    <tr>
      <th>${isEn ? 'Product' : 'Nguyên liệu'}</th>
      <th>${isEn ? 'Quantity' : 'Định lượng'}</th>
      <th>${isEn ? 'Nutri Role' : 'Vai trò dinh dưỡng'}</th>
    </tr>
  `;

  finalIngredients.forEach(item => {
    const isAltStyle = item.isAlternate ? "color:var(--color-danger); font-weight:700;" : "";
    tableRows += `
      <tr>
        <td style="${isAltStyle}">${item.name}</td>
        <td>${isEn ? item.qtyEn : item.qtyVi}</td>
        <td style="font-style:italic;">${isEn ? item.roleEn : item.roleVi}</td>
      </tr>
    `;
  });
  table.innerHTML = tableRows;

  // Pre-pend allergen warning if any swap occurred
  if (alertHtml) {
    const descContainer = document.getElementById("rec-desc");
    descContainer.insertAdjacentHTML('beforebegin', alertHtml);
  }

  // Render preparation steps
  const stepsList = document.getElementById("prep-steps");
  const stepsData = isEn ? recipe.prepEn : recipe.prepVi;
  stepsList.innerHTML = stepsData.map(step => `<li>${step}</li>`).join("");

  // Draw weekly forecast line chart
  drawLineChart(userGoal);

  // Smooth scroll
  document.getElementById("results-root").scrollIntoView({ behavior: "smooth" });
}

function animateSvgMacros(pcts) {
  // Update text label percentages
  document.getElementById("val-pct-protein").innerText = `${pcts.protein}%`;
  document.getElementById("val-pct-carbs").innerText = `${pcts.carbs}%`;
  document.getElementById("val-pct-fat").innerText = `${pcts.fat}%`;

  const circ = 2 * Math.PI * 70; // 439.8
  
  // Calculate stroke-dashoffsets based on values
  // Protein (Blue) arc
  const protOffset = circ - (circ * pcts.protein / 100);
  const pCircle = document.getElementById("arc-protein");
  pCircle.setAttribute("stroke-dasharray", circ);
  pCircle.setAttribute("stroke-dashoffset", protOffset);

  // Carbs (Yellow) arc
  const carbsOffset = circ - (circ * pcts.carbs / 100);
  const cCircle = document.getElementById("arc-carbs");
  cCircle.setAttribute("stroke-dasharray", circ);
  cCircle.setAttribute("stroke-dashoffset", carbsOffset);

  // Fat (Red) arc
  const fatOffset = circ - (circ * pcts.fat / 100);
  const fCircle = document.getElementById("arc-fat");
  fCircle.setAttribute("stroke-dasharray", circ);
  fCircle.setAttribute("stroke-dashoffset", fatOffset);
}

// RENDER DYNAMIC SVG LINE CHART
function drawLineChart(goal) {
  const path = document.getElementById("chart-line-path");
  const area = document.getElementById("chart-area-path");
  const dotsGroup = document.getElementById("chart-dots-group");
  
  if (!path || !area || !dotsGroup) return;
  
  let points = [];
  let labels = [];
  let strokeColor = "#2F6B2F"; // deep green
  let areaColor = "rgba(47, 107, 47, 0.08)";
  
  if (goal === "gain-muscle") {
    labels = ["65.0kg", "65.4kg", "65.8kg"];
    points = [
      { x: 35, y: 110, val: "65.0" },
      { x: 75, y: 100, val: "65.1" },
      { x: 115, y: 88, val: "65.25" },
      { x: 155, y: 75, val: "65.4" },
      { x: 195, y: 62, val: "65.55" },
      { x: 235, y: 48, val: "65.7" },
      { x: 275, y: 35, val: "65.8" }
    ];
  } else if (goal === "lose-fat") {
    strokeColor = "#E06A55"; // Orange-red
    areaColor = "rgba(224, 106, 85, 0.08)";
    labels = ["75.0kg", "74.5kg", "74.0kg"];
    points = [
      { x: 35, y: 35, val: "75.0" },
      { x: 75, y: 48, val: "74.8" },
      { x: 115, y: 62, val: "74.65" },
      { x: 155, y: 75, val: "74.5" },
      { x: 195, y: 90, val: "74.3" },
      { x: 235, y: 104, val: "74.15" },
      { x: 275, y: 115, val: "74.0" }
    ];
  } else if (goal === "eat-clean") {
    strokeColor = "#6FAF3A"; // Leaf green
    areaColor = "rgba(111, 175, 58, 0.08)";
    labels = ["80%", "87%", "94%"];
    points = [
      { x: 35, y: 110, val: "80%" },
      { x: 75, y: 98, val: "82%" },
      { x: 115, y: 85, val: "85%" },
      { x: 155, y: 72, val: "88%" },
      { x: 195, y: 58, val: "90%" },
      { x: 235, y: 45, val: "92%" },
      { x: 275, y: 30, val: "94%" }
    ];
  } else { // brain-focus
    strokeColor = "#2980B9"; // Blue
    areaColor = "rgba(41, 128, 185, 0.08)";
    labels = ["70%", "79%", "88%"];
    points = [
      { x: 35, y: 110, val: "70%" },
      { x: 75, y: 98, val: "72%" },
      { x: 115, y: 85, val: "75%" },
      { x: 155, y: 72, val: "78%" },
      { x: 195, y: 60, val: "82%" },
      { x: 235, y: 48, val: "85%" },
      { x: 275, y: 35, val: "88%" }
    ];
  }
  
  // Update Y labels
  document.getElementById("y-label-max").textContent = labels[2];
  document.getElementById("y-label-mid").textContent = labels[1];
  document.getElementById("y-label-min").textContent = labels[0];
  
  // Build line path
  const lineD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  path.setAttribute("d", lineD);
  path.setAttribute("stroke", strokeColor);
  
  // Build area path
  const areaD = `${lineD} L 275 120 L 35 120 Z`;
  area.setAttribute("d", areaD);
  area.setAttribute("fill", areaColor);
  
  // Draw dots and text tags
  dotsGroup.innerHTML = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="${strokeColor}" stroke="white" stroke-width="1.5" />
    <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-size="8" font-weight="700" fill="${strokeColor}">${p.val}</text>
  `).join("");

  // Translate X-axis labels dynamically (y=135)
  const isEn = document.body.classList.contains("lang-en");
  const xLabels = document.querySelectorAll("#svg-line-chart text[y='135']");
  xLabels.forEach((el, idx) => {
    el.textContent = isEn ? `D${idx + 1}` : `N${idx + 1}`;
  });
}

window.resetQuiz = function() {
  userGoal = "";
  userTime = "";
  userDiet = "omnivore";
  userServings = 1;
  excludedIngredients = [];
  currentStep = 1;
  activeRecipeIngredients = [];
  
  // Reset options UI
  const cards = document.querySelectorAll(".option-card");
  cards.forEach(c => c.classList.remove("selected"));
  
  const tags = document.querySelectorAll(".allergen-tag");
  tags.forEach(t => t.classList.remove("selected"));
  
  // Reset back btn
  const backBtn = document.getElementById("btn-back");
  if (backBtn) backBtn.style.visibility = "hidden";

  const nextBtn = document.getElementById("btn-next");
  const isEn = document.body.classList.contains("lang-en");
  if (nextBtn) nextBtn.innerHTML = isEn
    ? '<span class="lang-en">Next →</span>'
    : '<span class="lang-vi">Tiếp tục →</span>';

  // Swap back layout views
  document.getElementById("results-root").classList.remove("active");
  document.getElementById("quiz-form-area").style.display = "block";
  document.querySelector(".quiz-progress-bar").style.display = "flex";
  
  // Show step 1, hide all others
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const el = document.getElementById(`quiz-step-${i}`);
    if (el) el.classList.toggle("active", i === 1);
  }
  
  // Remove temporary swap messages
  const oldAlerts = document.querySelectorAll("#results-root div[style*='background:#FFF3CD']");
  oldAlerts.forEach(a => a.remove());

  updateProgressBar();
};


// 1-CLICK ADD COMBO INGREDIENTS TO CART
window.addAllIngredientsToCart = function() {
  const isEn = document.body.classList.contains("lang-en");
  
  if (!activeRecipeIngredients || activeRecipeIngredients.length === 0) {
    window.showToast(isEn ? "No items selected." : "Không có nguyên liệu nào để thêm.", "error");
    return;
  }

  let successCount = 0;
  let failMessage = "";

  activeRecipeIngredients.forEach(id => {
    const res = window.CartService.addToCart(id, 1);
    if (res.success) {
      successCount++;
    } else {
      failMessage = res.message;
    }
  });

  if (successCount > 0) {
    // Automatically apply promo code voucher for meal preppers
    window.CartService.applyVoucher("TUQUYGARDEN10");
    
    const successMsg = isEn 
      ? `Added ${successCount} recipe ingredients to cart! 10% discount applied automatically.` 
      : `Đã thêm ${successCount} nguyên liệu vào giỏ hàng! Đã tự động áp dụng mã giảm 10% tổng đơn.`;
      
    window.showToast(successMsg, "success");
    
    // Refresh header dynamic counts
    if (window.updateHeaderState) window.updateHeaderState();
  } else {
    window.showToast(failMessage || (isEn ? "Error adding items to cart." : "Lỗi khi thêm nguyên liệu vào giỏ."), "error");
  }
};

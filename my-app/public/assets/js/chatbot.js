// js/chatbot.js — Rule-based Tứ Quý Garden customer support chatbot (frontend only)
(function () {
  "use strict";

  const QUICK_CHIPS_VI = [
    "What fruits are in season?",
    "Suggest eat clean combo",
    "Products for gym-goers",
    "What is traceability?",
    "Delivery policy",
    "Checkout support"
  ];

  const QUICK_CHIPS_EN = [
    "What fruits are in season?",
    "Recommend eat-clean combo",
    "Products for gym users",
    "What is traceability?",
    "Delivery policy",
    "Checkout support"
  ];

  let greeted = false;
  let toggleBtn, panel, closeBtn, bodyEl, inputEl, sendBtn;

  // Weather data mapping for Open-Meteo codes
  function getWeatherMeta(code, lang) {
    const isEn = lang === "en";
    if (code === 0) return { icon: "☀️", descVi: "Nắng ấm", descEn: "Sunny" };
    if ([1, 2, 3].indexOf(code) !== -1) return { icon: "⛅", descVi: "Nhiều mây", descEn: "Partly Cloudy" };
    if ([45, 48].indexOf(code) !== -1) return { icon: "🌫️", descVi: "Sương mù", descEn: "Foggy" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].indexOf(code) !== -1) return { icon: "🌧️", descVi: "Có mưa mát mẻ", descEn: "Rainy" };
    if ([95, 96, 99].indexOf(code) !== -1) return { icon: "⛈️", descVi: "Giông bão", descEn: "Thunderstorm" };
    return { icon: "🌡️", descVi: "Mát mẻ", descEn: "Clear" };
  }

  // Fetch real-time weather from Open-Meteo
  function initWeatherStatus() {
    const lat = 10.2709;
    const lng = 105.9922;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          const metaVi = getWeatherMeta(code, "vi");
          const metaEn = getWeatherMeta(code, "en");

          window.currentWeather = {
            temp: temp,
            code: code,
            descVi: metaVi.descVi,
            descEn: metaEn.descEn,
            icon: metaVi.icon
          };

          updateWeatherUI();
        }
      })
      .catch(err => {
        console.warn("Failed to fetch live weather, using fallback:", err);
        window.currentWeather = {
          temp: 31,
          code: 0,
          descVi: "Nắng ấm",
          descEn: "Sunny",
          icon: "☀️"
        };
        updateWeatherUI();
      });
  }

  function updateWeatherUI() {
    const statusEl = document.querySelector(".chatbot-status");
    if (!statusEl || !window.currentWeather) return;

    // Check if weather badge already exists
    let badge = document.getElementById("chatbot-header-weather");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "chatbot-header-weather";
      badge.style.marginLeft = "8px";
      badge.style.padding = "2px 6px";
      badge.style.background = "rgba(255, 255, 255, 0.2)";
      badge.style.borderRadius = "10px";
      badge.style.fontSize = "10.5px";
      badge.style.fontWeight = "600";
      badge.style.color = "white";
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.gap = "3px";
      statusEl.appendChild(badge);
    }

    const w = window.currentWeather;
    const isEn = isEnglish();
    badge.title = isEn ? `Weather at Cái Bè farm: ${w.descEn}` : `Thời tiết tại vườn Cái Bè: ${w.descVi}`;
    badge.innerHTML = `${w.icon} ${w.temp}°C ${isEn ? "Cai Be" : "Cái Bè"}`;
  }

  function isEnglish() {
    return document.body.classList.contains("lang-en");
  }

  function formatFruitList(fruits, lang) {
    if (lang === "en") {
      if (fruits.length <= 1) return fruits[0] || "";
      const last = fruits[fruits.length - 1];
      const rest = fruits.slice(0, -1).join(", ");
      return rest + ", or " + last;
    }
    if (fruits.length <= 1) return fruits[0] || "";
    const last = fruits[fruits.length - 1];
    const rest = fruits.slice(0, -1).join(", ");
    return rest + " hoặc " + last;
  }

  function formatComboList(combos, lang) {
    if (lang === "en") {
      if (combos.length <= 1) return combos[0] || "";
      const last = combos[combos.length - 1];
      const rest = combos.slice(0, -1).join(", ");
      return rest + ", or " + last;
    }
    if (combos.length <= 1) return combos[0] || "";
    const last = combos[combos.length - 1];
    const rest = combos.slice(0, -1).join(", ");
    return rest + " hoặc " + last;
  }

  function getSeasonalProductsForMonth(month) {
    if (!window.MOCK_PRODUCTS) return [];
    let seasonSearch = "Quanh năm";
    if (month >= 2 && month <= 4) seasonSearch = "Mùa xuân";
    else if (month >= 5 && month <= 7) seasonSearch = "Mùa hè";
    else if (month >= 8 && month <= 10) seasonSearch = "Mùa thu";
    else seasonSearch = "Mùa đông";

    return window.MOCK_PRODUCTS.filter(p => 
      (p.season && p.season.toLowerCase().includes(seasonSearch.toLowerCase())) ||
      (p.season && p.season.toLowerCase().includes("quanh năm")) ||
      p.isSeasonal
    );
  }

  function getSeasonalResponse() {
    const lang = isEnglish() ? "en" : "vi";
    const month = new Date().getMonth() + 1;
    const seasonalProds = getSeasonalProductsForMonth(month);
    
    // Group into fruits (Fruits category) and combos (Combo Healthy category)
    const fruitsList = seasonalProds.filter(p => p.category === "Fruits").map(p => p.name);
    const combosList = seasonalProds.filter(p => p.category === "Combo Healthy").map(p => p.name);

    // Fallbacks if list is empty
    const fruits = fruitsList.length > 0 ? formatFruitList(fruitsList.slice(0, 5), lang) : (lang === "en" ? "organic fruits" : "các loại trái cây hữu cơ");
    const combos = combosList.length > 0 ? formatComboList(combosList.slice(0, 2), lang) : (lang === "en" ? "healthy combos" : "các gói combo sức khỏe");

    let seasonName = "";
    if (month >= 2 && month <= 4) seasonName = lang === "en" ? "Spring season" : "mùa xuân";
    else if (month >= 5 && month <= 7) seasonName = lang === "en" ? "Summer season" : "mùa hè";
    else if (month >= 8 && month <= 10) seasonName = lang === "en" ? "Autumn season" : "mùa thu";
    else seasonName = lang === "en" ? "Winter season" : "mùa đông";

    if (lang === "en") {
      return (
        "It's currently month " + month + ", which is the " + seasonName + ". " +
        "Tứ Quý Garden suggests fresh products in season: " + fruits + ". " +
        "For healthy convenience, you can choose: " + combos + "."
      );
    }

    return (
      "Hiện tại là tháng " + month + ", đang là " + seasonName + ". " +
      "Tứ Quý Garden gợi ý cho bạn các sản phẩm tươi ngon đúng vụ: " + fruits + ". " +
      "Để tiện lợi hơn, bạn có thể chọn các combo: " + combos + "."
    );
  }

  function matchesAny(text, keywords) {
    return keywords.some(function (kw) {
      return text.indexOf(kw) !== -1;
    });
  }

  function getBotResponse(message) {
    const raw = (message || "").trim();
    const text = raw.toLowerCase();
    const en = isEnglish();

    // 1. Dynamic product catalog lookup for loose matching
    if (window.MOCK_PRODUCTS) {
      const matched = [];
      const dictionary = {
        "vải": ["vải", "lychee"],
        "xoài": ["xoài", "mango"],
        "sầu riêng": ["sầu riêng", "durian"],
        "ổi": ["ổi", "guava"],
        "bưởi": ["bưởi", "pomelo"],
        "cam": ["cam", "orange"],
        "quýt": ["quýt", "tangerine"],
        "mận": ["mận", "plum"],
        "bơ": ["bơ", "avocado"],
        "dưa lưới": ["dưa lưới", "cantaloupe", "melon"],
        "dưa hấu": ["dưa hấu", "watermelon"],
        "chuối": ["chuối", "banana"],
        "dâu": ["dâu", "strawberry"],
        "nho": ["nho", "grape", "raisin"],
        "hồng": ["hồng", "persimmon"],
        "na": ["na", "custard"],
        "macca": ["macca", "macadamia"],
        "hạnh nhân": ["hạnh nhân", "almond"],
        "granola": ["granola"],
        "óc chó": ["óc chó", "walnut"],
        "dẻ cười": ["dẻ cười", "pistachio"],
        "chia": ["chia"],
        "bí xanh": ["bí xanh", "pumpkin seed"],
        "điều": ["điều", "cashew"]
      };

      for (const [key, keywords] of Object.entries(dictionary)) {
        if (keywords.some(kw => text.includes(kw))) {
          window.MOCK_PRODUCTS.forEach(p => {
            const nameLower = p.name.toLowerCase();
            const catLower = p.category.toLowerCase();
            if (nameLower.includes(key) || catLower.includes(key)) {
              matched.push(p);
            }
          });
        }
      }

      if (matched.length > 0) {
        const unique = matched.filter((value, index, self) =>
          self.findIndex(v => v.id === value.id) === index
        );
        const productList = unique.slice(0, 3).map(p => p.name).join(", ");
        return {
          text: en
            ? `Yes! We sell: ${productList}. You can view the products below.`
            : `Dạ có ạ! Cửa hàng có bán: ${productList}. Bạn xem chi tiết sản phẩm dưới đây nhé.`,
          suggestKey: null,
          suggestProducts: unique.slice(0, 3)
        };
      }
    }


    if (
      matchesAny(text, ["mùa", "tháng này", "trái cây gì", "season", "seasonal", "in season", "what fruits"]) ||
      text.indexOf("mua gì") !== -1 && text.indexOf("tháng") !== -1
    ) {
      return { text: getSeasonalResponse(), suggestKey: "seasonal" };
    }

    if (matchesAny(text, ["eat clean", "giảm cân", "healthy", "low sugar", "ăn sạch", "eat-clean"])) {
      return {
        text: en
          ? "For eat-clean or weight management goals, try low-sugar Granola, chia seeds, almonds, Seasonal Fruit Box, and Eat Clean Box. These work well for breakfast, office snacks, or healthy mini meals."
          : "For eat clean or weight control goals, you can choose low-sugar Granola, chia seeds, almonds, Seasonal Fruit Box, and Eat Clean Box. These products are perfect for a healthy breakfast, office snacks, or side meals.",
        suggestKey: "eatclean"
      };
    }

    if (matchesAny(text, ["gym", "tập gym", "tăng cơ", "protein", "fitness", "muscle"])) {
      return {
        text: en
          ? "For gym-goers, I recommend Gym Starter Box, Mix Nuts 5 loại, wood-roasted cashews, granola, and energy-rich fruits like banana, mango, or avocado. Great for pre- or post-workout snacks."
          : "For gym-goers, I recommend Gym Starter Box, Mix Nuts 5 types, wood-roasted cashews, granola, and energy-rich fruits like banana, mango, or avocado. Great for pre- or post-workout snacks.",
        suggestKey: "gym"
      };
    }

    if (matchesAny(text, ["qr", "truy xuất", "nguồn gốc", "traceability", "batch"])) {
      return {
        text: en
          ? "QR traceability lets you verify product details such as growing region, harvest date, supplier, batch code, storage tips, and certifications when available. It makes buying fruit online more transparent and trustworthy."
          : "QR traceability helps customers verify product info such as farm origin, harvest date, supplier, batch code, storage, and certs. This makes online shopping transparent and trustworthy.",
        suggestKey: "traceability"
      };
    }

    if (matchesAny(text, ["giao hàng", "ship", "shipping", "delivery", "vận chuyển"])) {
      return {
        text: en
          ? "Tứ Quý Garden prioritizes same-day fresh delivery in inner-city areas and packs carefully to preserve quality. Remote areas may depend on shipping time and product type."
          : "Tứ Quý Garden prioritizes same-day fresh delivery in inner-city areas and packs carefully. Outer areas may depend on transport time.",
        suggestKey: "delivery"
      };
    }

    if (matchesAny(text, ["checkout", "đặt hàng", "giỏ hàng", "cart", "thanh toán", "order"])) {
      return {
        text: en
          ? "Add products to your cart, review quantities, enter delivery details, and confirm your order on the checkout page. If you're unsure what to pick, I can suggest a suitable combo first."
          : "You can add items to cart, check quantities, enter recipient info, and confirm at checkout. Ask me if you need help choosing combos!",
        suggestKey: "checkout"
      };
    }

    if (matchesAny(text, ["vietgap", "haccp", "iso", "chứng nhận", "certification"])) {
      return {
        text: en
          ? "Certifications like VietGAP, HACCP, or ISO are shown when verified supplier records are available. In this prototype, certification badges illustrate transparency features."
          : "Certifications like VietGAP, HACCP, or ISO are displayed when verified by suppliers. In this prototype, badges are used to illustrate transparency features.",
        suggestKey: "certification"
      };
    }

    if (matchesAny(text, ["thời tiết", "nhiệt độ", "weather", "temperature"])) {
      if (window.currentWeather) {
        const w = window.currentWeather;
        return {
          text: en
            ? `At Cái Bè farm, Tiền Giang, the current temperature is ${w.temp}°C (${w.descEn}).`
            : `At Cái Bè farm, Tiền Giang, the current temperature is ${w.temp}°C (${w.descEn}).`,
          suggestKey: w.temp > 30 ? "seasonal" : "eatclean"
        };
      } else {
        return {
          text: en
            ? "I couldn't fetch the live weather at Cái Bè farm right now, but it's usually warm and sunny here!"
            : "I can't fetch the exact weather at Cái Bè farm right now, but it's usually warm and sunny here!",
          suggestKey: "general"
        };
      }
    }

    if (matchesAny(text, ["mua gì", "gợi ý", "recommend", "suggest", "sản phẩm", "products"])) {
      return {
        text: en
          ? "You can start with seasonal fruits, Granola hạt & trái cây, or Mix Nuts 5 loại. For families, try Seasonal Fruit Box. For a healthy lifestyle, choose Eat Clean Box or Combo Healthy."
          : "Start with seasonal fruits, Granola, or Mix Nuts 5 types. For families, try Seasonal Fruit Box. For healthy lifestyle, choose Eat Clean Box or Healthy Combo.",
        suggestKey: "general"
      };
    }

    return {
      text: en
        ? "I'm not sure about that yet. You can ask me about seasonal fruits, healthy combos, granola, nutritional seeds, traceability, delivery, or checkout."
        : "I'm not sure about that. Try asking me about seasonal fruits, healthy combos, granola, nuts, traceability, shipping, or checkout.",
      suggestKey: null
    };
  }

  function getSuggestedProducts(key) {
    if (!window.MOCK_PRODUCTS || !window.MOCK_PRODUCTS.length) return [];
    
    let filtered = [];
    const products = window.MOCK_PRODUCTS;

    if (key === "seasonal") {
      const month = new Date().getMonth() + 1;
      let seasonSearch = "Quanh năm";
      if (month >= 2 && month <= 4) seasonSearch = "Mùa xuân";
      else if (month >= 5 && month <= 7) seasonSearch = "Mùa hè";
      else if (month >= 8 && month <= 10) seasonSearch = "Mùa thu";
      else seasonSearch = "Mùa đông";

      filtered = products.filter(p => 
        (p.season && p.season.toLowerCase().includes(seasonSearch.toLowerCase())) || 
        (p.season && p.season.toLowerCase().includes("quanh năm")) ||
        p.isSeasonal
      );
    } 
    else if (key === "eatclean") {
      filtered = products.filter(p => 
        p.healthGoals && p.healthGoals.some(g => 
          g.toLowerCase().includes("clean") || 
          g.toLowerCase().includes("giảm cân") ||
          g.toLowerCase().includes("lành mạnh")
        )
      );
    } 
    else if (key === "gym") {
      filtered = products.filter(p => 
        p.healthGoals && p.healthGoals.some(g => 
          g.toLowerCase().includes("năng lượng") || 
          g.toLowerCase().includes("gym") ||
          g.toLowerCase().includes("tăng cơ") ||
          g.toLowerCase().includes("thể thao")
        )
      );
    } 
    else if (key === "traceability") {
      filtered = products.filter(p => p.origin && p.certification && p.certification.length > 0);
    } 
    else if (key === "certification") {
      filtered = products.filter(p => p.certification && p.certification.length > 0);
    }
    else {
      filtered = products.filter(p => p.isBestSeller || p.rating >= 4.8);
    }

    if (filtered.length === 0) {
      filtered = products;
    }

    return filtered.slice(0, 3);
  }

  function formatPrice(price) {
    if (typeof window.formatVND === "function") {
      return window.formatVND(price);
    }
    return price.toLocaleString() + "đ";
  }

  function renderProductCards(products) {
    if (!products.length) return "";

    const viewLabel = isEnglish() ? "View" : "Xem";
    return (
      '<div class="chatbot-product-cards">' +
      products
        .map(function (p) {
          return (
            '<a class="chatbot-product-card" href="detail.html?id=' +
            p.id +
            '">' +
            '<img src="' +
            p.image +
            '" alt="' +
            p.name +
            '" loading="lazy">' +
            '<div class="chatbot-product-info">' +
            '<strong>' +
            p.name +
            "</strong>" +
            '<span class="chatbot-product-price">' +
            formatPrice(p.price) +
            "</span>" +
            "</div>" +
            '<span class="chatbot-product-view">' +
            viewLabel +
            "</span>" +
            "</a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function scrollToBottom() {
    if (bodyEl) {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }
  }

  function appendMessage(type, html) {
    if (!bodyEl) return;
    const msg = document.createElement("div");
    msg.className = "chat-message " + type;
    
    // If it contains product cards, split them so they stack as a separate block
    if (html.indexOf('<div class="chatbot-product-cards">') !== -1) {
      const parts = html.split('<div class="chatbot-product-cards">');
      const textHtml = parts[0];
      const cardsHtml = '<div class="chatbot-product-cards">' + parts[1];
      msg.innerHTML = `
        <div class="chat-bubble">${textHtml}</div>
        ${cardsHtml}
      `;
    } else {
      msg.innerHTML = `<div class="chat-bubble">${html}</div>`;
    }
    
    bodyEl.appendChild(msg);
    scrollToBottom();
  }

  function renderGreeting() {
    const text = isEnglish()
      ? "Hi! I'm Tứ Quý Garden's assistant. I can help you choose seasonal fruits, recommend healthy combos, explain traceability, and support your shopping journey."
      : "Hi! I'm Tứ Quý Garden's assistant. I can help you choose seasonal fruits, recommend healthy combos, explain traceability, and support your shopping journey.";
    appendMessage("bot", text);
  }

  function renderChips() {
    if (!bodyEl) return;
    const existing = bodyEl.querySelector(".chatbot-chips-wrap");
    if (existing) existing.remove();

    const chips = isEnglish() ? QUICK_CHIPS_EN : QUICK_CHIPS_VI;
    const wrap = document.createElement("div");
    wrap.className = "chatbot-chips-wrap";

    const chipsEl = document.createElement("div");
    chipsEl.className = "chatbot-chips";

    chips.forEach(function (label) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chatbot-chip";
      btn.textContent = label;
      btn.addEventListener("click", function () {
        handleUserMessage(label);
      });
      chipsEl.appendChild(btn);
    });

    wrap.appendChild(chipsEl);
    bodyEl.appendChild(wrap);
    scrollToBottom();
  }

  let clickCount = 0;

  function handleUserMessage(message) {
    const trimmed = (message || "").trim();
    if (!trimmed) return;

    appendMessage("user", escapeHtml(trimmed));
    if (inputEl) inputEl.value = "";

    // Secret commands
    if (trimmed.startsWith("/gemini-key ")) {
      const key = trimmed.replace("/gemini-key ", "").trim();
      localStorage.setItem("tqg_gemini_key", key);
      const isEn = isEnglish();
      appendMessage("bot", isEn 
        ? "Gemini API Key saved! AI brain is now activated. Ask me anything!" 
        : "Gemini AI activated! Ask any questions to start chatting intelligently."
      );
      return;
    }
    if (trimmed === "/gemini-off") {
      localStorage.removeItem("tqg_gemini_key");
      const isEn = isEnglish();
      appendMessage("bot", "Gemini deactivated. Reverting to rule-based mode.");
      return;
    }

    const apiKey = localStorage.getItem("tqg_gemini_key") || "AQ.Ab8RN6L53Rw6w1KP37pj1ghA5zjQwWQtUat10wjjSz-qrhwNbw";
    
    // Check current user health goal for contextual recommendations
    let userGoal = "";
    const userJson = localStorage.getItem("tqg_current_user");
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        if (u.healthGoal) userGoal = u.healthGoal;
      } catch (e) {}
    }

    if (apiKey) {
      // Create a temporary "typing" bubble
      const typingDiv = document.createElement("div");
      typingDiv.className = "chat-message bot typing";
      typingDiv.innerHTML = `<div class="chat-bubble"><i>...</i></div>`;
      bodyEl.appendChild(typingDiv);
      scrollToBottom();

      const catalog = window.MOCK_PRODUCTS ? window.MOCK_PRODUCTS.map(p => `- ${p.name} (Giá: ${p.price.toLocaleString()}đ, ID: ${p.id}, Loại: ${p.category})`).join("\n") : "";
      const weather = window.currentWeather ? `${window.currentWeather.temp}°C, ${isEnglish() ? window.currentWeather.descEn : window.currentWeather.descVi}` : "30°C, Nắng ấm";
      const isEn = isEnglish();

      const goalInstruction = userGoal 
        ? `The customer's active health goal is: "${userGoal}". Please prioritize recommending products that align with this goal.` 
        : "";

      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `SYSTEM INSTRUCTION:\nYou are the smart AI Assistant of Tứ Quý Garden store. Chat friendly in English. Below is the actual catalog of products:\n${catalog}\n\nWeather at Cái Bè farm: ${weather}. ${goalInstruction}\n\nResponse requirements:\n1. Answer queries, recommend products suited for the weather or health goals.\n2. When recommending products, use the exact Product Name so the system can display buying cards below.\n3. Reply extremely briefly (no more than 3 sentences, 40-60 words) to fit the mobile chat view.\n\nUSER QUESTION:\n${trimmed}`
                }
              ]
            }
          ]
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("API status " + res.status);
        return res.json();
      })
      .then(data => {
        typingDiv.remove();
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
          const resText = data.candidates[0].content.parts[0].text.trim();
          
          // Match products in text
          const matchedProducts = [];
          if (window.MOCK_PRODUCTS) {
            window.MOCK_PRODUCTS.forEach(p => {
              if (resText.toLowerCase().includes(p.name.toLowerCase())) {
                matchedProducts.push(p);
              }
            });
          }
          
          let html = escapeHtml(resText);
          if (matchedProducts.length > 0) {
            // Deduplicate matched products
            const uniqueProducts = Array.from(new Set(matchedProducts.map(p => p.id)))
              .map(id => matchedProducts.find(p => p.id === id));
            html += renderProductCards(uniqueProducts.slice(0, 3));
          }
          appendMessage("bot", html);
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch(err => {
        console.warn("Gemini API Error, falling back to local engine:", err);
        typingDiv.remove();

        const result = getBotResponse(trimmed);
        let text = result.text;
        let suggestKey = result.suggestKey;

        // Personalize recommendation based on user health goal if applicable
        if (suggestKey === "general" && userGoal) {
          if (userGoal === "Tăng cơ" || userGoal.toLowerCase().includes("gym")) {
            suggestKey = "gym";
            text += isEn
              ? " Based on your fitness goals, I highly recommend our high-energy seeds and premium nut mixes!"
              : " Based on your gym goals, I recommend our premium nutritional seeds to boost your energy and protein intake!";
          } else if (userGoal === "Giảm cân" || userGoal.toLowerCase().includes("clean")) {
            suggestKey = "eatclean";
            text += isEn
              ? " Based on your healthy eating goals, I suggest our organic chia seeds and eat-clean combos."
              : " Perfect for your Eat Clean and weight control goals, I recommend our chia seeds and healthy combos.";
          }
        }

        // Apply weather enhancement if applicable
        if (window.currentWeather && (trimmed.toLowerCase().includes("gợi ý") || trimmed.toLowerCase().includes("recommend") || trimmed.toLowerCase().includes("mua gì"))) {
          if (window.currentWeather.temp > 30) {
            suggestKey = "seasonal";
            text += isEn
              ? ` (Note: It is currently very hot at Cái Bè farm ${window.currentWeather.temp}°C, so I highly recommend cooling fresh fruits!)`
              : ` (Note: The weather in Cái Bè is currently hot at ${window.currentWeather.temp}°C, so cooling fresh fruits are highly recommended!)`;
          } else if (window.currentWeather.code >= 51 && window.currentWeather.code <= 82) {
            suggestKey = "eatclean";
            text += isEn
              ? ` (Note: It is raining right now, which is perfect for a warm bowl of Granola!)`
              : ` (Note: It is rainy and cool now, perfect to enjoy a crunchy and rich jar of baked Granola!)`;
          }
        }

        let html = escapeHtml(text);
        const products = result.suggestProducts || getSuggestedProducts(suggestKey);
        if (products.length) {
          html += renderProductCards(products);
        }
        appendMessage("bot", html);
      });
    } else {
      // Offline mode fallback
      window.setTimeout(function () {
        const result = getBotResponse(trimmed);
        let text = result.text;
        let suggestKey = result.suggestKey;
        
        // If user has active goal, personalize general recommendations
        if (suggestKey === "general" && userGoal) {
          if (userGoal === "Tăng cơ" || userGoal.toLowerCase().includes("gym")) {
            suggestKey = "gym";
            text += isEnglish()
              ? " Based on your fitness goals, I highly recommend our high-energy seeds and premium nut mixes!"
              : " Based on your gym goals, I recommend our premium nutritional seeds to boost your energy and protein intake!";
          } else if (userGoal === "Giảm cân" || userGoal.toLowerCase().includes("clean")) {
            suggestKey = "eatclean";
            text += isEnglish()
              ? " Based on your healthy eating goals, I suggest our organic chia seeds and eat-clean combos."
              : " Perfect for your Eat Clean and weight control goals, I recommend our chia seeds and healthy combos.";
          }
        }
        
        // Enhance offline response based on weather if applicable
        if (window.currentWeather && (trimmed.toLowerCase().includes("gợi ý") || trimmed.toLowerCase().includes("recommend") || trimmed.toLowerCase().includes("mua gì"))) {
          if (window.currentWeather.temp > 30) {
            suggestKey = "seasonal";
            text += isEnglish()
              ? ` (Note: It is currently very hot at Cái Bè farm ${window.currentWeather.temp}°C, so I highly recommend cooling fresh fruits!)`
              : ` (Note: The weather in Cái Bè is currently hot at ${window.currentWeather.temp}°C, so cooling fresh fruits are highly recommended!)`;
          } else if (window.currentWeather.code >= 51 && window.currentWeather.code <= 82) {
            suggestKey = "eatclean";
            text += isEnglish()
              ? ` (Note: It is raining right now, which is perfect for a warm bowl of Granola!)`
              : ` (Note: It is rainy and cool now, perfect to enjoy a crunchy and rich jar of baked Granola!)`;
          }
        }

        let html = escapeHtml(text);
        const products = result.suggestProducts || getSuggestedProducts(suggestKey);
        if (products.length) {
          html += renderProductCards(products);
        }
        appendMessage("bot", html);
      }, 350);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function handleSend() {
    if (!inputEl) return;
    handleUserMessage(inputEl.value);
  }

  function openPanel() {
    if (!panel) return;
    panel.classList.add("open");

    if (!greeted) {
      greeted = true;
      renderGreeting();
      renderChips();
    }
  }

  function closePanel() {
    if (panel) panel.classList.remove("open");
  }

  function init() {
    const widget = document.getElementById("chatbotWidget");
    if (!widget) return;

    toggleBtn = document.getElementById("chatbotToggle");
    panel = document.getElementById("chatbotPanel");
    closeBtn = document.getElementById("chatbotClose");
    bodyEl = document.getElementById("chatbotBody");
    inputEl = document.getElementById("chatbotInput");
    sendBtn = document.getElementById("chatbotSend");

    if (!toggleBtn || !panel || !closeBtn || !bodyEl || !inputEl || !sendBtn) return;

    toggleBtn.addEventListener("click", function () {
      if (panel.classList.contains("open")) {
        closePanel();
      } else {
        openPanel();
      }
    });

    closeBtn.addEventListener("click", closePanel);

    sendBtn.addEventListener("click", handleSend);

    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });

    // Allow clicking the avatar 5 times to prompt for API Key
    const avatarEl = document.querySelector(".chatbot-avatar");
    if (avatarEl) {
      avatarEl.style.cursor = "pointer";
      avatarEl.addEventListener("click", () => {
        clickCount++;
        if (clickCount >= 5) {
          clickCount = 0;
          const currentKey = localStorage.getItem("tqg_gemini_key") || "";
          const key = prompt(
            isEnglish() 
              ? "Enter Google Gemini API Key to activate smart LLM Mode (leave blank to clear):" 
              : "Enter Google Gemini API Key to activate AI (leave empty to disable):",
            currentKey
          );
          if (key !== null) {
            const trimmedKey = key.trim();
            if (trimmedKey) {
              localStorage.setItem("tqg_gemini_key", trimmedKey);
              alert("Gemini API Key activated!");
            } else {
              localStorage.removeItem("tqg_gemini_key");
              alert("Gemini deactivated.");
            }
          }
        }
      });
    }

    // Load weather data on initialization
    initWeatherStatus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

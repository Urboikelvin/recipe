const apiKey = '89b14cb4c8fa4986bb82b84a63a13d37'; // New API key provided by user
const resultsContainer = document.getElementById('resultsContainer');
const searchButton = document.getElementById('searchButton');
const ingredientInput = document.getElementById('ingredientInput');

// Local fallback recipes
const localRecipes = {
    "rice": ["Fried Rice", "Rice Pudding", "Rice and Beans"],
    "chicken": ["Chicken Curry", "Grilled Chicken", "Chicken Soup"],
    "potato": ["Mashed Potatoes", "Potato Salad", "French Fries"]
};

async function checkApiStatus() {
    try {
        const testResponse = await fetch(
            `https://api.spoonacular.com/recipes/random?number=1&apiKey=${apiKey}`
        );
        
        if (testResponse.status === 401) {
            return { status: 'error', message: 'Invalid API key. Please check your Spoonacular API key.' };
        }
        if (testResponse.status === 402) {
            return { status: 'error', message: 'API limit reached. Please try again later or upgrade your plan.' };
        }
        if (!testResponse.ok) {
            return { status: 'error', message: 'API service unavailable. Please try again later.' };
        }
        return { status: 'ok' };
    } catch (error) {
        return { status: 'error', message: 'Network error. Please check your internet connection.' };
    }
}

async function searchRecipes(ingredient) {
    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredient)}&number=10&apiKey=${apiKey}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return { error: `API Error: ${errorData.message || 'Unknown error'}` };
        }

        const recipes = await response.json();
        return recipes;
    } catch (error) {
        console.error('Network Error:', error);
        return { error: 'Network error. Please try again later.' };
    }
}

searchButton.addEventListener('click', async () => {
    const ingredient = ingredientInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = 'Loading recipes...';

    if (ingredient) {
        // Check API status first
        const apiStatus = await checkApiStatus();
        
        if (apiStatus.status === 'error') {
            // Use local recipes if API is not working
            if (localRecipes[ingredient]) {
                const recipeList = document.createElement('ul');
                localRecipes[ingredient].forEach(recipe => {
                    const listItem = document.createElement('li');
                    listItem.textContent = recipe;
                    recipeList.appendChild(listItem);
                });
                resultsContainer.innerHTML = '';
                resultsContainer.appendChild(recipeList);
                resultsContainer.innerHTML += `<p style="color: orange;">${apiStatus.message} Using local recipes instead.</p>`;
            } else {
                resultsContainer.textContent = `No recipes found for this ingredient. ${apiStatus.message}`;
            }
            return;
        }

        // If API is working, try to fetch from Spoonacular
        const result = await searchRecipes(ingredient);
        
        if (result.error) {
            resultsContainer.textContent = result.error;
        } else if (result.length > 0) {
            const recipeList = document.createElement('ul');
            result.forEach(recipe => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${recipe.title}</h3>
                    <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 200px;">
                    <p>Missing ingredients: ${recipe.missedIngredientCount}</p>
                `;
                recipeList.appendChild(listItem);
            });
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(recipeList);
        } else {
            resultsContainer.textContent = 'No recipes found for this ingredient. Try a different ingredient.';
        }
    } else {
        resultsContainer.textContent = 'Please enter an ingredient.';
    }
});

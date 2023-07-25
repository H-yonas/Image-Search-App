const accessKey = "Q3fkFVLx2oWbJlGVhuRFknaizo5qGrQCRHYI_2P40c4";

const formE1 = document.querySelector("form");
const inputE1 = document.getElementById("search-input");
const searchResults = document.querySelector(".search-results");
const showMore = document.getElementById("show-more-button");
const perPageDropdown = document.getElementById("per-page-dropdown");
const clearResultsButton = document.getElementById("clear-results-button");

let inputData = "";
let page = 1;
let resultsPerPage = 10;
let totalResults = 0;
let images = []; // Array to store the loaded images

async function searchImages() {
  inputData = inputE1.value;
  const url = `https://api.unsplash.com/search/photos?page=${page}&query=${inputData}&per_page=${resultsPerPage}&client_id=${accessKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const results = data.results;

    if (page === 1) {
      searchResults.innerHTML = "";
      images = [];
      totalResults = data.total;
    }

    results.map((result) => {
      const imageWrapper = document.createElement("div");
      imageWrapper.classList.add("search-result");
      const image = document.createElement("img");
      image.src = result.urls.small;
      image.alt = result.alt_description;

      // Add a loading state to the images while they are being loaded
      image.onload = () => {
        image.classList.add("loaded");
      };

      const imageLink = document.createElement("a");
      imageLink.href = result.links.html;
      imageLink.target = "_blank";
      imageLink.textContent = result.alt_description;

      imageWrapper.appendChild(image);
      imageWrapper.appendChild(imageLink);
      searchResults.appendChild(imageWrapper);

      images.push(image); // Add image to the images array
    });

    // Show "Show more" button only if there are more results to show
    showMore.style.display = results.length < totalResults ? "block" : "none";
  } catch (error) {
    console.error("Error fetching data:", error.message);
    // Display an error message to the user
    searchResults.innerHTML = "<p>Error fetching data. Please try again later.</p>";
    showMore.style.display = "none";
  }
}

function preloadNextSet() {
  const nextSetStartIndex = (page - 1) * resultsPerPage;
  const nextSetEndIndex = nextSetStartIndex + resultsPerPage;
  for (let i = nextSetStartIndex; i < Math.min(nextSetEndIndex, totalResults); i++) {
    const image = new Image();
    image.src = images[i].src;
  }
}

function lazyLoadImages() {
  const { scrollTop, clientHeight } = document.documentElement;
  images.forEach((image) => {
    const { offsetTop, offsetHeight } = image.parentElement;
    if (offsetTop < scrollTop + clientHeight + 300 && offsetTop + offsetHeight > scrollTop) {
      image.src = image.src.replace("&w=10", ""); // Load the full-size image
    }
  });
}

function clearResults() {
  searchResults.innerHTML = "";
  page = 1;
  totalResults = 0;
  images = [];
  showMore.style.display = "none";
}

formE1.addEventListener("submit", (event) => {
  event.preventDefault();
  clearResults();
  searchImages();
});

showMore.addEventListener("click", () => {
  page++;
  searchImages();
});

perPageDropdown.addEventListener("change", () => {
  resultsPerPage = parseInt(perPageDropdown.value);
  clearResults();
  searchImages();
});

clearResultsButton.addEventListener("click", () => {
  clearResults();
});

// Add an event listener to the images to open the lightbox when clicked
images.forEach((image) => {
  image.addEventListener("click", () => {
    const lightbox = document.createElement("div");
    lightbox.classList.add("lightbox");

    const fullImage = new Image();
    fullImage.src = image.src.replace("&w=10", "");

    lightbox.appendChild(fullImage);
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", () => {
      lightbox.remove(); // Close the lightbox when clicked
    });
  });
});

// Implement search by keypress
inputE1.addEventListener("input", () => {
  clearResults();
  searchImages();
});

// Implement infinite scrolling
window.addEventListener("scroll", () => {
  lazyLoadImages();
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    if (resultsPerPage * page < totalResults) {
      page++;
      searchImages();
    }
  }
});

// Initial search on page load
searchImages();

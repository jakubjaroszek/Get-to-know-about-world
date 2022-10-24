"use strict";

const countryShowForm = document.querySelector('.country-show-form')
const countrySearchForm = document.querySelector('#search');
const countryCard = document.querySelector('.country-card');
let inputOfCountry = document.querySelector('.input-of-country');
const mapOfCountry = document.getElementsByClassName("country-detail-map")
let TranslatedCountryName = null;
let map = null;

//interaction with user
countrySearchForm.addEventListener('submit', function (e) {
    countryCard.innerHTML = "";
    displayLoadingSpinner();
    e.preventDefault()
    if (inputOfCountry.value.includes('polska')) {
        getCountryData('polska');
    }
    else {
        translateCountryName(inputOfCountry.value).then(() => {
            getCountryData(TranslatedCountryName);
          })
          inputOfCountry.value = "";
    }
}) 

//fetching data from restcountries API
async function  getCountryData(country) {
        const request =  await fetch(`https://restcountries.com/v3.1/name/${country}`);
        if(request.ok) {
            const data = await request.json();
            translateCountryData(data[0]);
        } else if (!request.ok) {
            removeLoadingSpinner();
            throw (alert('Podany kraj nie został znaleziony'));
        }
    }
 
 //function responsible for translating from polish to english input country from User
 async function translateCountryName (text) {
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=Polish|English`;
    
    const request = await fetch(apiUrl)
    if(request.ok) {
        const data = await request.json();
        return TranslatedCountryName = data.responseData.translatedText;
    } else if (!request.ok) {
        throw (console.error('Error with translating country name'))
    }
 }

 //function responsible for translating from english to polish data received from API
async function translateCountryData(data) {
    let TranslatedCountryData = [];
    
    //variables for displaying map in renderCountry function
    let [lat,lng] = data.latlng
    
    const flagOfCountry = data.flags.png;
    const populationOfCountry = data.population;
    
    //data for translation
    const currency = data.currencies;
    const [curr] = [...Object.values(currency)];
    const currencyOfCountry = curr.name;
    const nameOfCountry = data.name.common;
    const capitalOfCountry = data.capital;
    const continentOfCountry = data.continents;

    const dataForTranslation = [nameOfCountry,capitalOfCountry[0],currencyOfCountry,continentOfCountry[0]]
    
    //loop for iteration of data that need to be translated to polish language
    for (let i = 0; i < dataForTranslation.length; i++) {
        let apiUrl = `https://api.mymemory.translated.net/get?q=${dataForTranslation[i]}&langpair=English|Polish&de=dlgs1123@gmail.com`;

        const request = await fetch(apiUrl);
        if(request.ok) {    
            data = await request.json();
            TranslatedCountryData[i] = data.responseData.translatedText;
        }else if (!request.ok) {
            throw (console.error('Error with translateCountryData function'))
        }
    }
    //pushing of data that not need to be translated
    TranslatedCountryData.push(populationOfCountry)
    TranslatedCountryData.push(flagOfCountry)
    TranslatedCountryData.push(lat)
    TranslatedCountryData.push(lng)

    renderCountry(TranslatedCountryData);
}

//sending processed data to view in index.html
const renderCountry = function(data) {
    //generating html template and inserting data
    countryCard.innerHTML = `
    <div class="country-card-body">
                <p class="country-flag-detail">
                <img src="${data[5]}" class="country-flag" alt="Flag of country">
                </p>
                <p class="country-detail"><b>Nazwa kraju: </b>${data[0]}</p>
                <p class="country-detail"><b>Stolica: </b>${data[1]}</p>
                <p class="country-detail"><b>Waluta: </b>${data[2]}</p>
                <p class="country-detail"><b>Liczba ludności: </b>${(data[4]/ 1000000).toFixed(1)} M</p>
                <p class="country-detail"><b>Kontynent: </b>${data[3]}</p>
                <p class="country-detail"><b>Lokalizacja: </b></p>
                <p class="country-detail-map" id="map"></p>
    </div>
    `
    //generating map view of country with Leaflet library
    if (map != undefined) {
         map.remove(); 
        } 
            map = L.map("map").setView([data[6],data[7]],4)
   
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: 
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
        
            L.marker([data[6],data[7]])
            .addTo(map)
            .bindPopup(`<h2 class="country-name">${data[0]}</h2>`)
            .openPopup();
        
        removeLoadingSpinner();
}

//showing and hiding loading spinner;
const displayLoadingSpinner = () => {
    countryShowForm.classList.add('loader-spinner')
 }
 
 const removeLoadingSpinner = () => {
    countryShowForm.classList.remove('loader-spinner')
 }
"use strict";

const countrySearchForm = document.querySelector('#search');
const countryCard = document.querySelector('.country-card');
let inputOfCountry = document.querySelector('.input-of-country');
const mapOfCountry = document.getElementsByClassName("country-detail-map")
let TranslatedCountryName = null;
let map = null;

countrySearchForm.addEventListener('submit', function (e) {
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

async function  getCountryData(country) {
    await fetch(`https://restcountries.com/v3.1/name/${country}`).then(function (res) {
         console.log(res);
         if(!res.ok) throw new Error('country not found')
         return res.json()
     }).then(data => {
         translateCountryData(data[0]);
     }).catch(err => console.log(err))
 }
 
 
 async function translateCountryName (text) {
     let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=Polish|English`;
     await fetch(apiUrl).then(res => res.json()).then(data => {
        
         return TranslatedCountryName = data.responseData.translatedText;
         
      })
 }

async function translateCountryData(data) {
    let TranslatedCountryData = [];
    let [lat,lng] = data.latlng
    const flagOfCountry = data.flags.png;

    const currency = data.currencies;
    const [curr] = [...Object.values(currency)];

    const populationOfCountry = data.population;
    console.log(flagOfCountry)
    const nameOfCountry = data.name.common;
    const capitalOfCountry = data.capital;
    const currencyOfCountry = curr.name;
    const continentOfCountry = data.continents;

    const dataForTranslation = [nameOfCountry,capitalOfCountry[0],currencyOfCountry,continentOfCountry[0]]
    
    for (let i = 0 ; i < dataForTranslation.length; i++) {
        let apiUrl = `https://api.mymemory.translated.net/get?q=${dataForTranslation[i]}&langpair=English|Polish&de=dlgs1123@gmail.com`;
        await fetch(apiUrl).then(res => res.json()).then(data => {
            TranslatedCountryData[i] = data.responseData.translatedText;
         })
    
    }
    TranslatedCountryData.push(populationOfCountry)
    TranslatedCountryData.push(flagOfCountry)
    TranslatedCountryData.push(lat)
    TranslatedCountryData.push(lng)
    renderCountry(TranslatedCountryData);
 
}

const renderCountry = function(data) {
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
}
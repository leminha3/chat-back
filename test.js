import fetch from 'node-fetch';

const API_KEY = 'AIzaSyAr9DJl5tcO6lt2ElqKHJgtIhlgf8n7sRc'; // Thay bằng API key của bạn
const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
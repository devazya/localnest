export const PG_DATA = [
  { id:1, name:"GreenNest Premium PG", rent:8500, vacancy:true, food:true, gender:"Any", furnishing:"Fully Furnished", amenities:["WiFi","AC","Laundry","Security","Power Backup"], distance:"0.3 km", location:"Sector 5, Near Metro", owner:"Rajesh Kumar", verified:true, rating:4.5, reviews:34, from:"Immediate", occupancy:"Double / Triple", featured:true, sponsored:false, image:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80" },
  { id:2, name:"Sunrise Ladies PG", rent:7200, vacancy:true, food:true, gender:"Female", furnishing:"Semi Furnished", amenities:["WiFi","Hot Water","Laundry","CCTV","Warden"], distance:"0.6 km", location:"Block C, Green Avenue", owner:"Meera Sharma", verified:true, rating:4.7, reviews:58, from:"1st July", occupancy:"Single / Double", featured:true, sponsored:false, image:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" },
  { id:3, name:"Urban Stay Hostel", rent:6000, vacancy:false, food:false, gender:"Male", furnishing:"Basic Furnished", amenities:["WiFi","Parking","RO Water"], distance:"0.9 km", location:"Main Road, Opp. Park", owner:"Suresh Patel", verified:false, rating:3.9, reviews:22, from:"Aug 1", occupancy:"Triple", featured:false, sponsored:false, image:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80" },
  { id:4, name:"Comfort Zone PG", rent:9500, vacancy:true, food:true, gender:"Any", furnishing:"Fully Furnished", amenities:["WiFi","AC","Gym Access","Laundry","Housekeeping"], distance:"1.1 km", location:"Harmony Heights, Lane 2", owner:"Priya Nair", verified:true, rating:4.8, reviews:89, from:"Immediate", occupancy:"Single / Double", featured:true, sponsored:true, image:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80" },
  { id:5, name:"The Working Hub PG", rent:7800, vacancy:true, food:false, gender:"Any", furnishing:"Fully Furnished", amenities:["High-Speed WiFi","Co-working Desk","AC","24/7 Access"], distance:"0.4 km", location:"Tech Park Road", owner:"Ankit Verma", verified:true, rating:4.6, reviews:41, from:"Immediate", occupancy:"Single", featured:false, sponsored:false, image:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" },
  { id:6, name:"Maple Residency", rent:11000, vacancy:true, food:true, gender:"Any", furnishing:"Fully Furnished", amenities:["WiFi","AC","Pool Access","Gym","Rooftop"], distance:"1.5 km", location:"Premium Colony Gate 2", owner:"Deepak Malhotra", verified:true, rating:4.9, reviews:102, from:"15th July", occupancy:"Single / Couple", featured:true, sponsored:true, image:"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80" },
];

export const SHOP_DATA = [
  { id:1, name:"Tiffin Express", category:"Tiffin Service", description:"Home-cooked North & South Indian meals delivered daily.", phone:"+91 98765 11111", distance:"0.2 km", isOpen:true, hours:"7 AM – 9 PM", rating:4.6, reviews:120, tags:["Tiffin","Home Food","Delivery"], verified:true },
  { id:2, name:"QuickWash Laundry", category:"Laundry", description:"Same-day laundry and dry cleaning pickup & delivery.", phone:"+91 98765 22222", distance:"0.5 km", isOpen:true, hours:"8 AM – 8 PM", rating:4.3, reviews:78, tags:["Laundry","Dry Clean","Pickup"], verified:true },
  { id:3, name:"PrintMaster", category:"Printing", description:"Printing, scanning, photocopies, and ID photos.", phone:"+91 98765 33333", distance:"0.7 km", isOpen:true, hours:"9 AM – 10 PM", rating:4.1, reviews:44, tags:["Printing","Scanning","Xerox"], verified:false },
  { id:4, name:"Green Bowl Cafe", category:"Cafe", description:"Healthy smoothies, sandwiches, and work-friendly seating.", phone:"+91 98765 44444", distance:"0.3 km", isOpen:true, hours:"7 AM – 11 PM", rating:4.8, reviews:210, tags:["Cafe","Healthy","Work Space"], verified:true },
  { id:5, name:"Daily Fresh Grocery", category:"Grocery", description:"Fresh vegetables, dairy, and daily essentials at best prices.", phone:"+91 98765 55555", distance:"0.4 km", isOpen:false, hours:"6 AM – 12 PM, 5–9 PM", rating:4.2, reviews:65, tags:["Grocery","Fresh","Daily Needs"], verified:true },
  { id:6, name:"MediCare Pharmacy", category:"Pharmacy", description:"24/7 pharmacy with prescription medicines and health products.", phone:"+91 98765 66666", distance:"0.8 km", isOpen:true, hours:"24/7", rating:4.5, reviews:88, tags:["Pharmacy","Medicine","24/7"], verified:true },
];

export const GYM_DATA = [
  { id:1, name:"IronCore Fitness", fee:1200, facilities:["Free Weights","Cardio Zone","AC","Locker Room","Trainer"], timings:"5 AM – 11 PM", distance:"0.4 km", rating:4.7, reviews:140, trainers:3, offer:"First month 50% off", verified:true },
  { id:2, name:"Zen Yoga Studio", fee:1500, facilities:["Yoga","Meditation","AC","Personal Trainer","Diet Plan"], timings:"6 AM – 9 AM, 6 PM – 9 PM", distance:"0.6 km", rating:4.9, reviews:76, trainers:2, offer:null, verified:true },
  { id:3, name:"PowerZone Gym", fee:900, facilities:["Weights","Treadmill","Cycle","Basic Locker"], timings:"6 AM – 10 PM", distance:"1.0 km", rating:4.0, reviews:55, trainers:1, offer:"Free registration", verified:false },
];

export const COMMUNITY_POSTS = [
  { id:1, type:"announcement", author:"LocalNest Admin", avatar:"A", time:"2h ago", title:"Water supply disruption on July 1st, 6–10 AM", content:"Due to pipeline maintenance, water supply will be disrupted in Sectors 3–6 on July 1st between 6 AM and 10 AM. Please store water accordingly.", likes:45, comments:12, verified:true, tags:["Announcement","Maintenance"], pinned:true },
  { id:2, type:"ride", author:"Vikram S.", avatar:"V", time:"4h ago", title:"Ride share to Cyber City – Mon to Fri", content:"Looking for 2 more co-passengers for daily office commute. Cyber City via NH-48. Leaving at 8:30 AM, returning around 7 PM. Sharing petrol cost.", likes:18, comments:5, verified:false, tags:["Ride Share","Office Commute"], pinned:false },
  { id:3, type:"event", author:"Rooftop Gang", avatar:"R", time:"1d ago", title:"Weekend rooftop party – Saturday 8 PM", content:"Hosting a chill rooftop gathering this Saturday. Bring snacks or contribute ₹200. BYOB. Max 20 people. DM to confirm your spot!", likes:72, comments:28, verified:false, tags:["Event","Party","Weekend"], pinned:false },
  { id:4, type:"buy-sell", author:"Neha T.", avatar:"N", time:"6h ago", title:"Selling study table + chair – ₹2500", content:"Moving out next week. Selling a good condition wooden study table with revolving chair. ₹2500 for both. Pickup from Block D PG.", likes:11, comments:7, verified:false, tags:["Buy/Sell","Furniture"], pinned:false },
  { id:5, type:"roommate", author:"Aditya K.", avatar:"A", time:"12h ago", title:"Looking for male flatmate – July 1st", content:"Moving into a 2BHK flat near the metro. Need one male flatmate. Rent ₹7000/person incl. WiFi. Non-smoker preferred. Working professional.", likes:24, comments:9, verified:false, tags:["Roommate","Flat Share"], pinned:false },
  { id:6, type:"help", author:"Priyanka M.", avatar:"P", time:"3h ago", title:"Anyone know a good electrician nearby?", content:"Need an electrician urgently for fixing wiring issue in my room. If you have a trusted contact please share. Thank you!", likes:8, comments:15, verified:false, tags:["Help","Services"], pinned:false },
];

export const RIDE_DATA = [
  { id:1, author:"Vikram S.", avatar:"V", from:"Green Sector Gate", to:"Cyber City, Gurugram", time:"8:30 AM", returning:"7:00 PM", seats:2, recurring:true, days:["Mon","Tue","Wed","Thu","Fri"], cost:"Petrol split", vehicle:"Car – Hatchback", posted:"4h ago" },
  { id:2, author:"Sneha R.", avatar:"S", from:"Main Road, Near ATM", to:"Connaught Place", time:"9:00 AM", returning:"6:30 PM", seats:1, recurring:false, days:["Tomorrow only"], cost:"₹150 one way", vehicle:"Auto", posted:"2h ago" },
  { id:3, author:"Manoj K.", avatar:"M", from:"Block C Crossroads", to:"Noida Sector 62", time:"7:45 AM", returning:"8:00 PM", seats:3, recurring:true, days:["Mon","Wed","Fri"], cost:"₹80/day/person", vehicle:"Car – Sedan", posted:"1d ago" },
];

export const EVENT_DATA = [
  { id:1, title:"Saturday Cricket League", type:"Sports", date:"Sat, June 28", time:"7:00 AM", location:"Ground next to Gate 4", description:"Monthly inter-PG cricket match. Teams of 11. Register your PG team!", organizer:"Sports Club LocalNest", attending:34, contribution:null, tags:["Cricket","Sports","Team"] },
  { id:2, title:"Rooftop Potluck Party", type:"Social", date:"Sat, June 28", time:"8:00 PM", location:"Block D Rooftop", description:"Chill potluck party. Bring one dish. Music, lights, fun!", organizer:"Rooftop Gang", attending:18, contribution:"₹200 or 1 dish", tags:["Party","Social","Potluck"] },
  { id:3, title:"Startup Ideas Meetup", type:"Meetup", date:"Sun, June 29", time:"5:00 PM", location:"Green Bowl Cafe", description:"Share your startup idea, get feedback. Open to all hustlers in the community.", organizer:"LocalNest Community", attending:25, contribution:null, tags:["Startup","Meetup","Ideas"] },
];

export const BUY_SELL_DATA = [
  { id:1, title:"Study Table + Chair", price:2500, condition:"Good", category:"Furniture", seller:"Neha T.", avatar:"N", posted:"6h ago", description:"Wooden study table with revolving chair. Minor scratches on table top.", location:"Block D PG", sold:false },
  { id:2, title:"Cycle – Hero Sprint", price:3200, condition:"Good", category:"Vehicles", seller:"Ravi M.", avatar:"R", posted:"1d ago", description:"Hero Sprint 26T cycle. Serviced recently. Good for short commutes.", location:"Near Gate 2", sold:false },
  { id:3, title:"Bosch Induction Cooktop", price:1800, condition:"Like New", category:"Electronics", seller:"Ananya S.", avatar:"A", posted:"2d ago", description:"Used only 3 months. Moving out, selling cheap.", location:"Comfort Zone PG", sold:false },
  { id:4, title:"Dumbbell Set (10kg pair)", price:900, condition:"Good", category:"Fitness", seller:"Harsh V.", avatar:"H", posted:"3d ago", description:"Iron dumbbell pair, good for home workouts.", location:"Block A", sold:true },
];

export const ROOMMATE_DATA = [
  { id:1, author:"Aditya K.", avatar:"A", title:"Looking for male flatmate – 2BHK near metro", budget:7000, gender:"Male", moveIn:"July 1", location:"Near Metro Gate 3", prefs:["Non-smoker","Working professional","No loud parties on weekdays"], description:"Neat, well-furnished 2BHK. Rent ₹7000/person incl. WiFi & maintenance.", posted:"12h ago" },
  { id:2, author:"Divya R.", avatar:"D", title:"Female flatmate needed – 3BHK, Sector 5", budget:6500, gender:"Female", moveIn:"Immediate", location:"Sector 5, Block B", prefs:["Vegetarian preferred","Early riser OK","Homely atmosphere"], description:"Sharing with 2 other girls. Very friendly atmosphere. Kitchen available.", posted:"2d ago" },
];

export const LOCAL_PULSE = {
  newVacancies: 8,
  activeRides: 14,
  upcomingEvents: 3,
  buySellPosts: 22,
  activeUsers: 186,
  newPostsToday: 31,
};

export const POST_TYPE_CONFIG = {
  announcement: { label:"Announcement", color:"#6EE7B7", bg:"rgba(110,231,183,0.12)" },
  ride: { label:"Ride Share", color:"#60A5FA", bg:"rgba(96,165,250,0.12)" },
  event: { label:"Event", color:"#F59E0B", bg:"rgba(245,158,11,0.12)" },
  "buy-sell": { label:"Buy/Sell", color:"#A78BFA", bg:"rgba(167,139,250,0.12)" },
  roommate: { label:"Roommate", color:"#FB7185", bg:"rgba(251,113,133,0.12)" },
  help: { label:"Help", color:"#94A3B8", bg:"rgba(148,163,184,0.12)" },
};

export const NAV_LINKS = [
  { label:"Home", id:"home" },
  { label:"PGs", id:"pgs" },
  { label:"Shops", id:"shops" },
  { label:"Gyms", id:"gyms" },
  { label:"Community", id:"community" },
  { label:"Rides", id:"rideshare" },
  { label:"Events", id:"events" },
  { label:"Buy/Sell", id:"buysell" },
  { label:"Roommates", id:"roommates" },
];

export const NETWORK_NODES = [
  { id:"pg", label:"PG", icon:"🏠", color:"#6EE7B7", x:50, y:20 },
  { id:"gym", label:"Gym", icon:"💪", color:"#60A5FA", x:80, y:45 },
  { id:"cafe", label:"Cafe", icon:"☕", color:"#F59E0B", x:70, y:75 },
  { id:"shop", label:"Shop", icon:"🛍", color:"#A78BFA", x:30, y:80 },
  { id:"events", label:"Events", icon:"🎉", color:"#FB7185", x:15, y:50 },
  { id:"rides", label:"Rides", icon:"🚗", color:"#34D399", x:25, y:22 },
  { id:"community", label:"Community", icon:"💬", color:"#F8FAFC", x:50, y:50 },
];

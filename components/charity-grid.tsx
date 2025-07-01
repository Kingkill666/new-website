import React from "react";

const charities = [
  {
    name: "Holy Family Village",
    stat: "500+ Veterans Housed",
    description: "Housing and support for veterans, low-income families, and the homeless.",
    logo: "/images/charity-logos/holy-family-village-logo.png",
    link: "#",
  },
  {
    name: "Camp Cowboy",
    stat: "1,200+ Lives Changed",
    description: "Equine therapy helping veterans overcome trauma and reconnect with life.",
    logo: "/images/charity-logos/camp-cowboy-logo.png",
    link: "#",
  },
  {
    name: "Veterans In Need Project",
    stat: "3,000+ Veterans Helped",
    description: "Emergency assistance for Arizona veterans facing immediate hardships.",
    logo: "/images/charity-logos/veterans-in-need-logo.png",
    link: "#",
  },
  {
    name: "Honor HER Foundation",
    stat: "200+ Women Housed",
    description: "Housing and services for homeless women veterans in Florida.",
    logo: "/images/charity-logos/honor-her-logo.jpeg",
    link: "#",
  },
  {
    name: "Patriots Promise",
    stat: "800+ Veterans Served",
    description: "Permanent housing solutions and comprehensive veteran support services.",
    logo: "/images/charity-logos/patriots-promise-logo.png",
    link: "#",
  },
  {
    name: "Victory For Veterans",
    stat: "24/7 Crisis Support",
    description: "Suicide prevention and mental health support for veterans and first responders.",
    logo: "/images/charity-logos/victory-for-veterans-logo.jpeg",
    link: "#",
  },
  {
    name: "Little Patriots Embraced",
    stat: "Coming Soon",
    description: "Supporting military children and families with care packages and programs.",
    logo: "/images/charity-logos/Little-Patriots-Embraced-logo.png",
    link: "https://www.littlepatriotsembraced.org/",
  },
  {
    name: "Magicians On Mission",
    stat: "",
    description: "Bringing hope and entertainment to deployed troops through magic shows.",
    logo: "/images/charity-logos/Magicians-On-Mission.png",
    link: "https://magiciansonmission.org/",
  },
  {
    name: "April Forces",
    stat: "Coming Soon",
    description: "Support For Veterans And Their Families Through Community Initiatives. 🇺🇦",
    logo: "/images/charity-logos/April-Forces-logo.png",
    link: "https://aprilforces.com/en/about_us",
    green: true,
  },
];

export default function CharityGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
      {charities.map((charity) => (
        <div
          key={charity.name}
          className="bg-white rounded-xl shadow flex flex-col items-start w-full max-w-[320px] h-[190px] mx-auto p-5"
        >
          <div className="flex items-center mb-2">
            <img
              src={charity.logo}
              alt={charity.name}
              className="w-10 h-10 rounded mr-3 object-contain"
            />
            <div>
              <div className="font-bold text-lg leading-tight mb-0.5">{charity.name}</div>
              <div className={`font-semibold text-sm ${charity.green ? 'text-green-700' : 'text-green-600'}`}>{charity.stat}</div>
            </div>
          </div>
          <div className="text-gray-700 text-sm mb-2 line-clamp-3">{charity.description}</div>
          <a
            href={charity.link}
            className="mt-auto flex justify-center w-full border-2 border-blue-600 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 font-bold transition text-center text-base border-2"
            style={{ minHeight: '36px' }}
          >
            Learn More
          </a>
        </div>
      ))}
    </div>
  );
} 
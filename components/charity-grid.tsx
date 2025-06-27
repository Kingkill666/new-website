import React from "react";

const charities = [
  {
    name: "Holy Family Village",
    stat: "500+ Veterans Housed",
    description: "Housing and support for veterans, low-income families, and homeless individuals.",
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
    link: "#",
  },
  {
    name: "Magicians On Mission",
    stat: "Coming Soon",
    description: "Bringing hope and entertainment to deployed troops through magic shows.",
    logo: "/images/charity-logos/Magicians-On-Mission.png",
    link: "#",
  },
  {
    name: "April Forces",
    stat: "Coming Soon",
    description: "Підтримка ветеранів та їхніх сімей через громадські ініціативи.",
    logo: "/images/charity-logos/April-Forces-logo.png",
    link: "#",
    green: true,
  },
];

export default function CharityGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {charities.map((charity) => (
        <div key={charity.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center mb-3">
            <img src={charity.logo} alt={charity.name} className="w-12 h-12 rounded mr-3 object-contain" />
            <div>
              <div className="font-bold text-lg">{charity.name}</div>
              <div className={`font-semibold text-sm ${charity.green ? 'text-green-700' : 'text-green-600'}`}>{charity.stat}</div>
            </div>
          </div>
          <div className="text-gray-700 mb-4">{charity.description}</div>
          <a
            href={charity.link}
            className="mt-auto inline-block border border-blue-500 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 font-medium transition"
          >
            Learn More
          </a>
        </div>
      ))}
    </div>
  );
} 
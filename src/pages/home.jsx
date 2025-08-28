import Navbar from "@/components/UI/navbar";
import * as React from "react";
import { Link } from "react-router-dom";
import {
  Code,
  MessageSquare,
  Flag,
  LayoutDashboard as Dashboard,
  ArrowRight,
  Zap,
  Shield,
  Settings,
  BarChart3,
} from "lucide-react";
// Image icons (place files at src/assets/rde_icon.png and src/assets/other_icon.png)
import rdeIcon from "@/assets/img1.png";
import otherIcon from "@/assets/img2.png";
import useStore from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";

const servicesBase = [
  {
    id: 1,
    title: "VTC LAB",
    description: "Vehicle Test Cell Laboratory",
  icon: MessageSquare,
  img: otherIcon,
    href: "/vtc-chennai",
  color: "from-emerald-400 to-teal-400",
  bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  borderColor: "border-emerald-300 dark:border-emerald-700",
  iconBg: "bg-emerald-600",
  },
  {
    id: 2,
    title: "VTC Nashik LAB",
    description: "Vehicle Test Cell Laboratory",
  icon: Flag,
  img: otherIcon,
    href: "/vtc-nashik",
  color: "from-purple-400 to-pink-400",
  bgColor: "bg-purple-100 dark:bg-purple-900/20",
  borderColor: "border-purple-300 dark:border-purple-700",
  iconBg: "bg-purple-600",
  },
    {
    id: 3,
    title: "RDE LAB",
    description: "Real Driving Emissions Laboratory",
  icon: Code,
  img: rdeIcon,
    href: "/rde-chennai",
  color: "from-blue-400 to-cyan-400",
  bgColor: "bg-blue-100 dark:bg-blue-900/20",
  borderColor: "border-blue-300 dark:border-blue-700",
  iconBg: "bg-blue-600",
  },
  {
    id: 4,
    title: "PDCD LAB",
    description: "Powertrain Durability Chassis Dyno Laboratory",
  icon: Zap,
  img: otherIcon,
    href: "/pdcd-lab",
  color: "from-amber-400 to-yellow-400",
  bgColor: "bg-amber-100 dark:bg-amber-900/20",
  borderColor: "border-amber-300 dark:border-amber-700",
  iconBg: "bg-amber-600",
  },
];

// Change the export to default and rename the component
export default function HomePage() {
  const { userRole, userId, userName, userTeam } = useAuth();

  // Filter services based on userRole and userTeam
  let filteredBaseServices = [];
  if (userRole === "ProjectTeam") {
    // Show all labs for ProjectTeam role
    filteredBaseServices = servicesBase;
  } else if (userRole === "TestEngineer" || userRole === "Admin") {
    // Filter by team for TestEngineer and Admin
    if (userTeam === "vtc") {
      filteredBaseServices = servicesBase.filter(service =>
        service.title === "VTC LAB"
      );
    }
    else if (userTeam === "vtc_n") {
      filteredBaseServices = servicesBase.filter(service =>
        service.title === "VTC Nashik LAB"
      );
    } else if (userTeam === "rde") {
      filteredBaseServices = servicesBase.filter(service =>
        service.title === "RDE LAB"
      );
    } else if (userTeam === "pdcd") {
      filteredBaseServices = servicesBase.filter(service =>
        service.title === "PDCD LAB"
      );
    } else {
      filteredBaseServices = [];
    }
  } else {
    filteredBaseServices = [];
  }

  const services = filteredBaseServices;

  // Center cards if 1 or 2 labs, else use default grid
  let gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  let gridJustify = "";
  if (services.length === 1) {
    gridCols = "grid-cols-1";
    gridJustify = "justify-center";
  } else if (services.length === 2) {
    gridCols = "grid-cols-1 md:grid-cols-2";
    gridJustify = "justify-center";
  }

  // Fetch dropdown options globally on home page mount
  const fetchProjects = useStore((state) => state.fetchProjects);
  const fetchDomains = useStore((state) => state.fetchDomains);
  const fetchVehicleModels = useStore((state) => state.fetchVehicleModels);
  React.useEffect(() => {
    fetchProjects();
    fetchDomains();
    fetchVehicleModels();
  }, [fetchProjects, fetchDomains, fetchVehicleModels]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-white dark:bg-black overflow-hidden relative">
        {/* Main Content Area - takes remaining space */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Hero Section */}
          <div className="relative overflow-hidden mt-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
            
            <div className="relative px-6 py-2 sm:px-8 sm:py-4 lg:px-12 lg:py-6">
              <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-2">
                  <div className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/20 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/20 mb-6 relative">
                    <Zap className="h-4 w-4 mr-2" />
                    Enterprise Testing Platform
                  </div>
                  <h1 className="text-3xl pb-2 font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                    DBMRS 
                    <span className="block pt-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      VTC & RDE Portal
                    </span>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="px-6 pt-4 pb-0 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              {/* <div className="text-center mb-4">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                  Platform Modules
                </h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  Access specialized tools and workflows for different testing requirements
                </p>
              </div> */}

              <div className={`grid ${gridCols} gap-6 mb-0 ${gridJustify}`}>
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Card
                      key={service.id}
                      className={`group relative overflow-hidden border dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${service.bgColor} ${service.borderColor} flex flex-col h-full`}
                    >
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                      <CardHeader className="relative pb-4">
                        <div className={`w-16 h-16 rounded-2xl ${service.iconBg} mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                          {service.img ? (
                            <img src={service.img} alt={`${service.title} icon`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                          {service.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {service.description}
                        </CardDescription>
                      </CardHeader>

                      <CardFooter className="relative pt-4 mt-auto">
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 hover:from-gray-800 hover:to-gray-600 dark:hover:from-gray-100 dark:hover:to-gray-300 transition-all duration-300 group-hover:shadow-lg"
                        >
                          <Link to={service.href} className="flex items-center justify-center">
                            Access Module
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

                 {/* Footer - responsive at bottom
         <footer className="w-full py-3 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-2">
           <div className="container mx-auto px-4 flex items-center justify-between">
             <span className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0.1</span>
             <span className="text-sm text-gray-500 dark:text-gray-400">Mahindra.AI@All Rights Reserved.</span>
           </div>
         </footer> */}
      </div>
  </>
  );
}
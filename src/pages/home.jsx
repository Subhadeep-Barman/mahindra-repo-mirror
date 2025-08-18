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
    title: "RDE LAB",
    description: "Real Driving Emissions testing and analysis",
    icon: Code,
    href: "/rde-chennai",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500",
  },
  {
    id: 2,
    title: "VTC LAB",
    description: "Vehicle Testing Center operations and management",
    icon: MessageSquare,
    href: "/vtc-chennai",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-500",
  },
  {
    id: 3,
    title: "VTC Nashik LAB",
    description: "Vehicle Testing Center operations and management",
    icon: Flag,
    href: "/vtc-nashik",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-500",
  },
  {
    id: 4,
    title: "PDCD LAB",
    description: "Powertrain Development and Calibration Department",
    icon: Zap,
    href: "/pdcd-lab",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-500",
  },
];

// Change the export to default and rename the component
export default function HomePage() {
  const { userRole, userId, userName } = useAuth();
  const filteredBaseServices = servicesBase.filter(service => 
    service.title !== "PDCD LAB" || userRole === "ProjectTeam" || userRole === "Admin"
  );

  // Use only the filtered base services (no admin portal card)
  const services = filteredBaseServices;

  // Determine grid columns based on number of services
  const gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

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
                  <div className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/20 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/20 mb-6 relative z-[60]">
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

              <div className={`grid ${gridCols} gap-6 mb-0`}>
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                                          <Card
                        key={service.id}
                        className={`group relative overflow-hidden border dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${service.bgColor} ${service.borderColor}`}
                      >
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <CardHeader className="relative pb-4">
                        <div className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                          {service.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {service.description}
                        </CardDescription>
                      </CardHeader>

                      <CardFooter className="relative pt-4">
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
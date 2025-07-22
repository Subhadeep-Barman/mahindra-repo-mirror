import Navbar from "@/components/UI/navbar";
import * as React from "react";
import { Link } from "react-router-dom";
import {
  Code,
  MessageSquare,
  Flag,
  LayoutDashboard as Dashboard,
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
    title: "RDE Chennai",
    icon: Code,
    href: "/rde-chennai",
  },
  {
    id: 2,
    title: "VTC Chennai",
    icon: MessageSquare,
    href: "/vtc-chennai",
  },
  {
    id: 3,
    title: "VTC Nashik",
    icon: Flag,
    href: "/vtc-nashik",
  },
];

// Change the export to default and rename the component
export default function HomePage() {
  // Move useAuth hook call inside the component
  const { userRole, userId, userName } = useAuth();

  // Conditionally add ADMIN Portal only if user is not Test Engineer or Project Team
  const services = [
    ...servicesBase,
    ...(userRole !== "TestEngineer" && userRole !== "ProjectTeam"
      ? [{
          id: 4,
          title: "ADMIN Portal",
          icon: Dashboard,
          href: "/admin-portal",
        }]
      : []),
  ];

  // Determine grid columns based on number of services
  const gridCols =
    services.length === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center";

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
      <div
        className="w-full bg-white dark:bg-black flex flex-col"
      >
        <div className="flex flex-col items-center mt-10 mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-red-600 dark:text-red-400 drop-shadow-lg tracking-tight mb-2">
            DBMRS VTC & RDE Portal
          </h1>
        </div>
        <div className="flex justify-center flex-1">
          <div className={`grid ${gridCols} gap-8 lg:gap-10 w-full max-w-7xl mx-auto`}>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.id}
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-0 dark:border dark:border-zinc-800 w-full max-w-[280px] min-h-[380px] flex flex-col justify-center mx-auto shadow-xl hover:shadow-2xl dark:shadow-black/60 transition-all duration-300 hover:scale-105 group"
                  style={{
                    boxShadow:
                      "0 2px 16px 0 rgba(0,0,0,0.25)", // black shadow only
                  }}
                >
                  <CardHeader className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-400 dark:from-red-700 dark:to-red-500 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white drop-shadow" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-400 dark:text-gray-300">
                        {service.description ||
                          "Access the " + service.title + " module"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-center pb-6">
                    <Button
                      asChild
                      variant="ghost"
                      className="bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 text-red-500 dark:text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-400 dark:hover:from-red-700 dark:hover:to-red-500 px-6 py-2 text-base font-semibold rounded-full shadow transition-all duration-300"
                    >
                      <Link to={service.href}>Explore &rarr;</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
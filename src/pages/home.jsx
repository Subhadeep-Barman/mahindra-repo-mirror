import Navbar from "@/components/ui/navbar"
import * as React from "react"
import {
  Code,
  MessageSquare,
  Flag,
  LayoutDashboard as Dashboard, // assuming using lucide-react
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const services = [
  {
    id: 1,
    title: "RDE Chennai",
    description: "Commodo qui nulla ipsum ea cupidatat sit aliquip",
    icon: Code,
    href: "/rde-chennai",
  },
  {
    id: 2,
    title: "VTC Chennai",
    description: "Commodo qui nulla ipsum ea cupidatat sit aliquip",
    icon:  MessageSquare,
    href: "/vtc-chennai",
  },
  {
    id: 3,
    title: "VTC Nashik",
    description: "Commodo qui nulla ipsum ea cupidatat sit aliquip",
    icon: Flag,
    href: "/vtc-nashik",
  },
  {
    id: 4,
    title: "ADMIN Portal",
    description: "Commodo qui nulla ipsum ea cupidatat sit aliquip",
    icon: Dashboard,
    href: "/admin-portal",
  },
]

// Change the export to default and rename the component
export default function HomePage() {
  return (
    <>  
      <Navbar />
      <div className="flex justify-center mt-40 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 w-full max-w-7xl mx-auto ">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.id} className="w-full max-w-[280px] min-h-[380px] flex flex-col justify-between mx-auto  shadow-xl hover:shadow-2xl transition-shadow ">
                <CardHeader className="flex flex-col items-center text-center space-y-4 pt-10 ">
                  <div className="h-14 w-14 rounded-full  bg-red-500 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold dark:text-red-500 text-black">{service.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-400">{service.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-center pb-6">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 text-sm font-medium"
                  >
                    <a href={service.href}>Explore →</a>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}


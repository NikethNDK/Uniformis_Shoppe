import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';

const BannerManagement = () => {
  const [banners, setBanners] = useState([
    {
      id: 1,
      name: "Banner for home page",
      startDate: new Date("2024/01/05"),
      endDate: new Date("2024/01/14"),
      image: "/placeholder.jpg",
      status: "active",
    },
  ]);

  const [newBanner, setNewBanner] = useState({
    name: "",
    startDate: null,
    endDate: null,
    image: null,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBanner((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addBanner = () => {
    if (newBanner.name && newBanner.startDate && newBanner.endDate && newBanner.image) {
      setBanners((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...newBanner,
          status: "active",
        },
      ]);
      setNewBanner({
        name: "",
        startDate: null,
        endDate: null,
        image: null,
      });
    }
  };

  const toggleStatus = (id) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? { ...banner, status: banner.status === "active" ? "disabled" : "active" }
          : banner
      )
    );
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.abs(end - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>

      {/* Existing Banners List */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
          >
            <span className="w-1/4">{banner.name}</span>
            <span className="w-1/4">
              {format(banner.startDate, "MM/dd/yyyy")}
            </span>
            <span className="w-1/4">
              {format(banner.endDate, "MM/dd/yyyy")}
            </span>
            <span className="w-1/6">
              {calculateDaysLeft(banner.endDate)} Days Left
            </span>
            <span className="w-1/6">
              <Button
                variant={banner.status === "active" ? "destructive" : "secondary"}
                className="mr-2"
                onClick={() => toggleStatus(banner.id)}
              >
                {banner.status === "active" ? "Disable" : "Enable"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteBanner(banner.id)}
              >
                Delete
              </Button>
            </span>
          </div>
        ))}
      </div>

      {/* Add New Banner Form */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Add banner</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">Name</label>
            <Input
              value={newBanner.name}
              onChange={(e) =>
                setNewBanner((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block mb-2">Starting date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBanner.startDate ? (
                    format(newBanner.startDate, "MM/dd/yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newBanner.startDate}
                  onSelect={(date) =>
                    setNewBanner((prev) => ({ ...prev, startDate: date }))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block mb-2">Ending date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBanner.endDate ? (
                    format(newBanner.endDate, "MM/dd/yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newBanner.endDate}
                  onSelect={(date) =>
                    setNewBanner((prev) => ({ ...prev, endDate: date }))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block mb-2">Upload image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div className="col-span-3">
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={addBanner}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
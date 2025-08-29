// "use client";

// import { useState } from "react";
import CategoryManager from "./CategoryManager";
import QuestionManager from "./QuestionManager";
// import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  // const [activeTab, setActiveTab] = useState<
  //   "categories" | "questions" | "analytics"
  // >("categories");

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Quiz Admin Dashboard</h1>

      {/* <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === "categories" ? "default" : "outline"}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </Button>
        <Button
          variant={activeTab === "questions" ? "default" : "outline"}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "outline"}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </Button>
      </div>

      {activeTab === "categories" && <CategoryManager />}
      {activeTab === "questions" && <QuestionManager />}
      {activeTab === "analytics" && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Analytics Coming Soon</h2>
          <p className="text-gray-600">
            Quiz performance analytics will be available here.
          </p>
        </div>
      )} */}

      {/* <Tabs defaultValue="questions" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        <TabsContent value="questions">
          <QuestionManager />
        </TabsContent>
        <TabsContent value="analytics">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">
              Analytics Coming Soon
            </h2>
            <p className="text-gray-600">
              Quiz performance analytics will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs> */}

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Give this wrapper a min height so switching doesn't reflow page */}
        <div className="mt-4 min-h-[220px]">
          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionManager />
          </TabsContent>
          <TabsContent value="analytics">
            <p>Some other content</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

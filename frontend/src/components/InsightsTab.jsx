import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Network,
  ArrowRight,
} from "lucide-react";
const premiumEasing = [0.25, 0.1, 0.25, 1];
const InsightsTab = ({ onInsightClick }) => {
  const insights = [
    {
      type: "takeaway",
      title: "Key Takeaway",
      category: "Essential Knowledge",
      insight:
        "Transfer learning reduces model training time by 78% while maintaining 94% accuracy across enterprise applications. This paradigm shift enables rapid AI deployment at scale.",
      source: "Deep Learning Fundamentals.pdf • Page 15",
      confidence: 96,
      icon: Target,
      iconColor: "text-[#DC2626]",
      bgGradient: "from-[#DC2626]/5 via-[#DC2626]/3 to-transparent",
      borderAccent: "border-[#DC2626]/20",
      actionable: "Implement pre-trained models for 3x faster deployment",
    },
    {
      type: "fact",
      title: "Did You Know?",
      category: "Surprising Discovery",
      insight:
        "Neural networks trained on diverse datasets show 23% better generalization to edge cases compared to single-domain training. This contradicts the common belief that specialized training always performs better.",
      source: "AI Strategy 2024.pdf • Page 32",
      confidence: 87,
      icon: Lightbulb,
      iconColor: "text-amber-600",
      bgGradient: "from-amber-500/6 via-amber-500/3 to-transparent",
      borderAccent: "border-amber-500/20",
      surprising: true,
    },
    {
      type: "contradiction",
      title: "Contradiction Found",
      category: "Conflicting Evidence",
      insight:
        "Document A advocates for centralized AI governance, while Document B suggests distributed decision-making leads to 40% faster innovation cycles. This highlights an unresolved strategic tension.",
      source: "Multiple sources",
      confidence: 91,
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      bgGradient: "from-orange-500/5 via-orange-500/3 to-transparent",
      borderAccent: "border-orange-500/20",
      documents: ["Governance Framework.pdf", "Innovation Strategy.pdf"],
      critical: true,
    },
    {
      type: "example",
      title: "Real-World Example",
      category: "Practical Application",
      insight:
        "Tesla's Autopilot system demonstrates the power of continuous learning - their models improve by processing 1 billion miles of driving data monthly, achieving superhuman performance in specific scenarios.",
      source: "Technical Implementation.pdf • Page 67",
      confidence: 93,
      icon: Sparkles,
      iconColor: "text-emerald-600",
      bgGradient: "from-emerald-500/5 via-emerald-500/3 to-transparent",
      borderAccent: "border-emerald-500/20",
      practical: true,
    },
    {
      type: "inspiration",
      title: "Cross-Document Inspiration",
      category: "Novel Connection",
      insight:
        "Combining Document A's transfer learning approach with Document B's ethical framework could create a new \"Responsible Transfer Learning\" methodology that accelerates AI deployment while ensuring bias mitigation.",
      source: "Synthesized insight",
      confidence: 84,
      icon: Network,
      iconColor: "text-purple-600",
      bgGradient: "from-purple-500/5 via-purple-500/3 to-transparent",
      borderAccent: "border-purple-500/20",
      innovative: true,
      documents: ["Deep Learning Fundamentals.pdf", "Ethics in AI.pdf"],
    },
  ];
  return (
    <>
      {" "}
      <motion.section
        key="insights"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: premiumEasing }}
        className="space-y-6"
      >
        {" "}
        {insights.map((insight, index) => (
          <motion.article
            key={index}
            className="group relative overflow-hidden rounded-3xl cursor-pointer"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.15,
              duration: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: { duration: 0.3, type: "spring", stiffness: 400 },
            }}
            onClick={() => onInsightClick(insight)}
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 249, 0.9) 50%, rgba(243, 244, 246, 0.7) 100%)`,
              backdropFilter: "blur(20px) saturate(150%)",
              border: `1px solid ${
                insight.borderAccent.split("/")[0].split("-")[1] === "DC2626"
                  ? "rgba(220, 38, 38, 0.2)"
                  : insight.borderAccent.includes("amber")
                  ? "rgba(245, 158, 11, 0.2)"
                  : insight.borderAccent.includes("orange")
                  ? "rgba(251, 146, 60, 0.2)"
                  : insight.borderAccent.includes("emerald")
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(139, 92, 246, 0.2)"
              }`,
              boxShadow:
                "0 25px 50px rgba(26, 26, 26, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            {" "}
            {/* Dynamic category indicator */}{" "}
            <div className="absolute top-0 left-0 w-full h-1">
              {" "}
              <motion.div
                className={`h-full bg-gradient-to-r ${
                  insight.type === "takeaway"
                    ? "from-[#DC2626] via-[#EF4444] to-[#DC2626]"
                    : insight.type === "fact"
                    ? "from-amber-500 via-yellow-400 to-amber-500"
                    : insight.type === "contradiction"
                    ? "from-orange-500 via-red-400 to-orange-500"
                    : insight.type === "example"
                    ? "from-emerald-500 via-green-400 to-emerald-500"
                    : "from-purple-500 via-violet-400 to-purple-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  delay: index * 0.2 + 0.5,
                  duration: 1,
                  ease: "easeOut",
                }}
              />{" "}
              {/* Animated shimmer effect */}{" "}
              <motion.div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)`,
                }}
                animate={{ x: [-100, 200] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.5,
                }}
              />{" "}
            </div>{" "}
            <div className="relative p-6">
              {" "}
              
              {/* Minimal header */}{" "}
              <header className="mb-4">
                {" "}
                <div className="flex items-start space-x-3">
                  {" "}
                  {/* Simple insight type indicator */}{" "}
                  <motion.div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${insight.bgGradient} border ${insight.borderAccent} flex-shrink-0`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {" "}
                    <insight.icon
                      className={`w-5 h-5 ${insight.iconColor}`}
                    />{" "}
                    {/* Simple indicators */}{" "}
                    {insight.critical && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}{" "}
                    {insight.surprising && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-500 rounded-full" />
                    )}{" "}
                    {insight.innovative && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full" />
                    )}{" "}
                  </motion.div>{" "}
                  <div className="flex-1">
                    {" "}
                    <motion.div
                      className="flex items-center space-x-2 mb-1"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    >
                      {" "}
                      <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight group-hover:text-[#DC2626] transition-colors duration-300">
                        {" "}
                        {insight.title}{" "}
                      </h3>{" "}
                      {insight.type === "contradiction" && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">
                          {" "}
                          CRITICAL{" "}
                        </span>
                      )}{" "}
                    </motion.div>{" "}
                    {/* Minimal source reference at top */}{" "}
              <motion.div
                className="flex items-center space-x-2 mb-4 text-xs text-[#1A1A1A] opacity-60"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {" "}
                <div className="w-1 h-1 bg-[#DC2626] rounded-full" />{" "}
                <span className="font-medium">{insight.source}</span>{" "}
              </motion.div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Clean insight content */}{" "}
                <motion.div
                  className={`relative bg-gradient-to-r ${insight.bgGradient} border ${insight.borderAccent} rounded-xl p-4`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                  style={{
                    backdropFilter: "blur(8px) saturate(110%)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 1px 4px rgba(0, 0, 0, 0.03)",
                  }}
                >
                  {" "}
                  <p className="text-[#1A1A1A] opacity-90 leading-relaxed text-sm font-medium">
                    {" "}
                    {insight.insight}{" "}
                  </p>{" "}
                  {/* Minimal actionable insight */}{" "}
                  {insight.actionable && (
                    <motion.div
                      className="mt-3 p-2 bg-[#DC2626]/8 border border-[#DC2626]/15 rounded-lg"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                    >
                      {" "}
                      <div className="flex items-center space-x-1 mb-1">
                        {" "}
                        <ArrowRight className="w-3 h-3 text-[#DC2626]" />{" "}
                        <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wide">
                          {" "}
                          Action{" "}
                        </span>{" "}
                      </div>{" "}
                      <p className="text-xs text-[#1A1A1A] font-medium">
                        {" "}
                        {insight.actionable}{" "}
                      </p>{" "}
                    </motion.div>
                  )}{" "}
                </motion.div>{" "}
              </header>{" "}
              {/* Click to view more indicator */}{" "}
              <footer className="mt-4">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-xs font-medium text-[#1A1A1A] opacity-60">
                    {" "}
                    Click to view detailed analysis{" "}
                  </span>{" "}
                  <div className="flex items-center space-x-1 text-[#DC2626] opacity-70">
                    {" "}
                    <span className="text-xs font-medium">
                      View Details
                    </span>{" "}
                    <ArrowRight className="w-3 h-3" />{" "}
                  </div>{" "}
                </div>{" "}
              </footer>{" "}
              {/* Minimal hover overlay */}{" "}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${
                    insight.iconColor.split("-")[1] === "DC2626"
                      ? "rgba(220, 38, 38, 0.02)"
                      : insight.iconColor.includes("amber")
                      ? "rgba(245, 158, 11, 0.02)"
                      : insight.iconColor.includes("orange")
                      ? "rgba(251, 146, 60, 0.02)"
                      : insight.iconColor.includes("emerald")
                      ? "rgba(16, 185, 129, 0.02)"
                      : "rgba(139, 92, 246, 0.02)"
                  } 0%, transparent 60%)`,
                }}
              />{" "}
            </div>{" "}
          </motion.article>
        ))}{" "}
      </motion.section>{" "}
  {/* Modal is now handled by parent */}
    </>
  );
};
export default InsightsTab;

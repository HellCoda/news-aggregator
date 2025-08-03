import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../ui';

interface StatsChartProps {
  categories: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  total: number;
}

export const StatsChart: React.FC<StatsChartProps> = ({ categories, total }) => {
  // Calculer les pourcentages
  const categoriesWithPercentage = categories.map(cat => ({
    ...cat,
    percentage: total > 0 ? (cat.count / total) * 100 : 0
  }));

  // Trier par count décroissant
  const sortedCategories = [...categoriesWithPercentage].sort((a, b) => b.count - a.count);

  return (
    <Card variant="glass">
      <CardBody>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Répartition par catégorie
        </h3>
        
        {/* Graphique en barres horizontales */}
        <div className="space-y-3">
          {sortedCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">{category.name}</span>
                <span className="text-sm font-medium text-text-primary">
                  {category.count} ({category.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-6 bg-background-hover rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className={`absolute left-0 top-0 h-full ${category.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Total */}
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-tertiary">Total des articles</span>
            <span className="text-lg font-bold text-text-primary">{total}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Composant de graphique circulaire (donut chart)
export const DonutChart: React.FC<StatsChartProps> = ({ categories, total }) => {
  const radius = 80;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  let cumulativePercentage = 0;
  
  return (
    <Card variant="glass">
      <CardBody className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Vue d'ensemble
        </h3>
        
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              stroke="var(--bg-hover)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            
            {/* Segments */}
            {categories.map((category, index) => {
              const percentage = total > 0 ? (category.count / total) * 100 : 0;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference / 100;
              
              cumulativePercentage += percentage;
              
              return (
                <motion.circle
                  key={category.name}
                  stroke={`var(--cat-${category.name.toLowerCase()})`}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary">{total}</span>
            <span className="text-sm text-text-tertiary">articles</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-2 w-full">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              <span className="text-xs text-text-secondary">{category.name}</span>
              <span className="text-xs font-medium text-text-primary ml-auto">
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
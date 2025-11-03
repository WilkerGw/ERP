// Caminho: ERP-FRONT-main/src/components/dashboard/StatCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  content?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, content }) => {
  return (
    // A classe h-full garante que todos os cards na mesma linha do grid tenham a mesma altura.
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      {/* - A classe "flex-1" faz com que esta área cresça para preencher o espaço vertical.
        - "min-h-0" é uma correção para garantir que o overflow funcione corretamente em layouts flex.
      */}
      <CardContent className="flex flex-1 flex-col min-h-0">
        <div className="text-2xl font-bold">
          {value}
        </div>
        {/* O conteúdo (como a lista de aniversariantes) será renderizado aqui */}
        {content}
      </CardContent>
    </Card>
  );
};

export default StatCard;
import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20">
      <Container size="md">
        <EmptyState
          icon={<FileQuestion className="w-8 h-8 stroke-[1.75]" />}
          title="Page Not Found"
          description="The packaging page or resource you requested does not exist or may have been relocated."
        />
        <div className="text-center mt-6">
          <Link to="/">
            <Button variant="primary" size="md">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

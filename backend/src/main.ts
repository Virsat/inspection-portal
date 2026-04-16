import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security Headers
  app.use(helmet());

  // Restrict CORS in production
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [/^https:\/\/.*\.your-app\.com$/] // Replace with real production domain
      : '*', 
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

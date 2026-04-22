import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup of "Footwear" section...');

  // 1. Find the section "Footwear"
  const section = await prisma.section.findFirst({
    where: { name: 'Footwear' },
    include: { questions: true }
  });

  if (!section) {
    console.log('Section "Footwear" not found. Nothing to delete.');
    return;
  }

  console.log(`Found section "Footwear" (ID: ${section.id}) with ${section.questions.length} questions.`);

  // 2. Delete answers for these questions
  const questionIds = section.questions.map(q => q.id);
  const deletedAnswers = await prisma.answer.deleteMany({
    where: { questionId: { in: questionIds } }
  });
  console.log(`Deleted ${deletedAnswers.count} answers associated with "Footwear".`);

  // 3. Delete questions
  const deletedQuestions = await prisma.question.deleteMany({
    where: { sectionId: section.id }
  });
  console.log(`Deleted ${deletedQuestions.count} questions associated with "Footwear".`);

  // 4. Delete the section
  await prisma.section.delete({
    where: { id: section.id }
  });
  console.log('Deleted section "Footwear".');

  console.log('Cleanup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

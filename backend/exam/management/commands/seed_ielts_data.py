"""
Management command to seed IELTS exam data
Usage: python manage.py seed_ielts_data
"""
from django.core.management.base import BaseCommand
from exam.models import Exam, Section, Passage, Question, Option


class Command(BaseCommand):
    help = 'Seed IELTS exam data with sample reading passage and questions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to seed IELTS data...'))
        
        # Create or get exam
        exam, created = Exam.objects.get_or_create(
            title='IELTS Academic Practice Test 1',
            defaults={
                'description': 'Full IELTS Academic practice test with all 4 modules',
                'total_duration': 180,  # 3 hours
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created exam: {exam.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Exam already exists: {exam.title}'))
        
        # Create Reading Section
        reading_section, created = Section.objects.get_or_create(
            exam=exam,
            section_type='READING',
            defaults={
                'title': 'Reading Section',
                'description': 'IELTS Academic Reading Test - 3 passages, 40 questions, 60 minutes',
                'duration': 60,
                'order': 2,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Reading section'))
        
        # Create Reading Passage 1
        passage1_content = """
The History of Coffee

Coffee is one of the world's most popular beverages, with a rich history that spans centuries and continents. The origins of coffee can be traced back to the ancient coffee forests of Ethiopia, where legend has it that a goat herder named Kaldi discovered the energizing effects of coffee beans around 850 AD.

According to the legend, Kaldi noticed that his goats became unusually energetic after eating berries from a certain tree. Curious, he tried the berries himself and experienced a similar boost in energy. He shared his discovery with local monks, who began using the berries to stay awake during long hours of prayer.

From Ethiopia, coffee cultivation spread to the Arabian Peninsula, particularly Yemen, where it was first cultivated on a large scale. By the 15th century, coffee was being grown in the Yemeni district of Arabia and by the 16th century, it had reached Persia, Egypt, Syria, and Turkey.

Coffee houses began to appear in cities across the Near East, becoming centers of social activity and communication. These establishments were known as "Schools of the Wise" because of the intellectual conversations that took place there.

The beverage made its way to Europe in the 17th century, brought by traders and travelers. Initially, coffee was met with suspicion and was even called "the bitter invention of Satan" by some. However, Pope Clement VIII tasted coffee and gave it papal approval, which helped it gain acceptance throughout Europe.

Coffee houses quickly became popular in England, France, Germany, and other European countries. They served as meeting places for merchants, artists, and intellectuals. In London alone, there were over 300 coffee houses by the mid-17th century.

The Dutch were the first to successfully cultivate coffee outside of Arabia, establishing plantations in their colonies in Java (Indonesia) in the late 17th century. This marked the beginning of coffee's global expansion.

Today, coffee is grown in over 70 countries, primarily in the equatorial regions of the Americas, Southeast Asia, India, and Africa. Brazil is the world's largest coffee producer, followed by Vietnam, Colombia, and Indonesia.

The global coffee industry employs millions of people and is a significant source of income for many developing countries. However, the industry also faces challenges, including price volatility, climate change, and concerns about fair trade practices.

Modern coffee culture has evolved significantly, with specialty coffee shops, artisanal roasters, and a growing appreciation for different coffee varieties and brewing methods. From the traditional Turkish coffee to Italian espresso, from American drip coffee to Japanese pour-over, coffee continues to be a beloved beverage that brings people together.
"""
        
        passage1, created = Passage.objects.get_or_create(
            section=reading_section,
            passage_number=1,
            defaults={
                'title': 'The History of Coffee',
                'content': passage1_content.strip()
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Passage 1: The History of Coffee'))
        
        # Create questions for Passage 1
        questions_data = [
            {
                'question_number': 1,
                'question_type': 'TRUE_FALSE',
                'question_text': 'Kaldi discovered coffee beans in the 9th century.',
                'correct_answer': 'TRUE',
                'explanation': 'The text states that Kaldi discovered coffee around 850 AD, which is the 9th century.'
            },
            {
                'question_number': 2,
                'question_type': 'TRUE_FALSE',
                'question_text': 'Coffee was first cultivated in Yemen.',
                'correct_answer': 'TRUE',
                'explanation': 'The text states that coffee was first cultivated on a large scale in Yemen.'
            },
            {
                'question_number': 3,
                'question_type': 'TRUE_FALSE',
                'question_text': 'Pope Clement VIII initially banned coffee in Europe.',
                'correct_answer': 'FALSE',
                'explanation': 'The text states that Pope Clement VIII gave coffee papal approval, not that he banned it.'
            },
            {
                'question_number': 4,
                'question_type': 'FILL_BLANK',
                'question_text': 'Coffee houses in the Near East were known as "Schools of the _____".',
                'correct_answer': 'Wise',
                'explanation': 'The text explicitly states that coffee houses were called "Schools of the Wise".'
            },
            {
                'question_number': 5,
                'question_type': 'MCQ',
                'question_text': 'Which country is the world\'s largest coffee producer?',
                'correct_answer': 'Brazil',
                'options': [
                    {'label': 'A', 'text': 'Vietnam', 'is_correct': False},
                    {'label': 'B', 'text': 'Brazil', 'is_correct': True},
                    {'label': 'C', 'text': 'Colombia', 'is_correct': False},
                    {'label': 'D', 'text': 'Indonesia', 'is_correct': False}
                ],
                'explanation': 'The text states that Brazil is the world\'s largest coffee producer.'
            },
            {
                'question_number': 6,
                'question_type': 'MCQ',
                'question_text': 'Where did the Dutch first successfully cultivate coffee outside Arabia?',
                'correct_answer': 'Java',
                'options': [
                    {'label': 'A', 'text': 'Brazil', 'is_correct': False},
                    {'label': 'B', 'text': 'Java', 'is_correct': True},
                    {'label': 'C', 'text': 'Colombia', 'is_correct': False},
                    {'label': 'D', 'text': 'Ethiopia', 'is_correct': False}
                ],
                'explanation': 'The text states that the Dutch established plantations in Java (Indonesia).'
            },
            {
                'question_number': 7,
                'question_type': 'FILL_BLANK',
                'question_text': 'By the mid-17th century, there were over _____ coffee houses in London.',
                'correct_answer': '300',
                'explanation': 'The text states there were over 300 coffee houses in London by the mid-17th century.'
            },
            {
                'question_number': 8,
                'question_type': 'TRUE_FALSE',
                'question_text': 'Coffee is grown in more than 70 countries today.',
                'correct_answer': 'TRUE',
                'explanation': 'The text explicitly states that coffee is grown in over 70 countries.'
            },
            {
                'question_number': 9,
                'question_type': 'SHORT_TEXT',
                'question_text': 'What was coffee initially called by some Europeans?',
                'correct_answer': 'the bitter invention of Satan',
                'explanation': 'The text states that coffee was called "the bitter invention of Satan" by some Europeans.'
            },
            {
                'question_number': 10,
                'question_type': 'MCQ',
                'question_text': 'What is mentioned as a challenge facing the coffee industry?',
                'correct_answer': 'Price volatility',
                'options': [
                    {'label': 'A', 'text': 'Price volatility', 'is_correct': True},
                    {'label': 'B', 'text': 'Lack of demand', 'is_correct': False},
                    {'label': 'C', 'text': 'Overproduction', 'is_correct': False},
                    {'label': 'D', 'text': 'Government restrictions', 'is_correct': False}
                ],
                'explanation': 'The text mentions price volatility, climate change, and fair trade concerns as challenges.'
            },
            {
                'question_number': 11,
                'question_type': 'TRUE_FALSE',
                'question_text': 'Coffee houses in Europe served only merchants and traders.',
                'correct_answer': 'FALSE',
                'explanation': 'The text states that coffee houses served merchants, artists, and intellectuals, not just merchants.'
            },
            {
                'question_number': 12,
                'question_type': 'FILL_BLANK',
                'question_text': 'Coffee cultivation spread from Ethiopia to the _____ Peninsula.',
                'correct_answer': 'Arabian',
                'explanation': 'The text states that coffee spread from Ethiopia to the Arabian Peninsula, particularly Yemen.'
            },
            {
                'question_number': 13,
                'question_type': 'MCQ',
                'question_text': 'What is the main purpose of the final paragraph?',
                'correct_answer': 'To describe modern coffee culture',
                'options': [
                    {'label': 'A', 'text': 'To criticize modern coffee production', 'is_correct': False},
                    {'label': 'B', 'text': 'To describe modern coffee culture', 'is_correct': True},
                    {'label': 'C', 'text': 'To predict future coffee trends', 'is_correct': False},
                    {'label': 'D', 'text': 'To compare different brewing methods', 'is_correct': False}
                ],
                'explanation': 'The final paragraph describes the evolution of modern coffee culture and different brewing methods.'
            }
        ]
        
        for q_data in questions_data:
            question, created = Question.objects.get_or_create(
                section=reading_section,
                passage=passage1,
                question_number=q_data['question_number'],
                defaults={
                    'question_type': q_data['question_type'],
                    'question_text': q_data['question_text'],
                    'correct_answer': q_data['correct_answer'],
                    'explanation': q_data.get('explanation', ''),
                    'marks': 1
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Question {q_data["question_number"]}'))
                
                # Create options for MCQ questions
                if q_data['question_type'] == 'MCQ' and 'options' in q_data:
                    for opt_data in q_data['options']:
                        Option.objects.create(
                            question=question,
                            option_label=opt_data['label'],
                            option_text=opt_data['text'],
                            is_correct=opt_data['is_correct'],
                            order=ord(opt_data['label']) - ord('A') + 1
                        )
        
        # Create other sections (Listening, Writing, Speaking)
        listening_section, created = Section.objects.get_or_create(
            exam=exam,
            section_type='LISTENING',
            defaults={
                'title': 'Listening Section',
                'description': 'IELTS Academic Listening Test - 4 parts, 40 questions, 30 minutes',
                'duration': 30,
                'order': 1,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Listening section'))
        
        writing_section, created = Section.objects.get_or_create(
            exam=exam,
            section_type='WRITING',
            defaults={
                'title': 'Writing Section',
                'description': 'IELTS Academic Writing Test - Task 1 and Task 2, 60 minutes',
                'duration': 60,
                'order': 3,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Writing section'))
        
        speaking_section, created = Section.objects.get_or_create(
            exam=exam,
            section_type='SPEAKING',
            defaults={
                'title': 'Speaking Section',
                'description': 'IELTS Speaking Test - 3 parts, 11-14 minutes',
                'duration': 14,
                'order': 4,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Speaking section'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Successfully seeded IELTS exam data!'))
        self.stdout.write(self.style.SUCCESS(f'Exam ID: {exam.id}'))
        self.stdout.write(self.style.SUCCESS(f'Reading Passage 1: {passage1.id}'))
        self.stdout.write(self.style.SUCCESS(f'Total Questions Created: {len(questions_data)}'))


"""
Management command to create a complete exam from JSON
Usage: python manage.py create_exam_example <json_file_path>
"""
import json
from django.core.management.base import BaseCommand
from exam.models import Exam, Section, Passage, Question, Option


class Command(BaseCommand):
    help = 'Create an IELTS exam from JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to JSON file with exam data')

    def handle(self, *args, **options):
        json_file = options['json_file']
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                exam_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {json_file}'))
            return
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'Invalid JSON: {e}'))
            return
        
        # Create exam
        exam = Exam.objects.create(
            title=exam_data['title'],
            description=exam_data.get('description', ''),
            total_duration=exam_data.get('total_duration', 180),
            is_active=exam_data.get('is_active', True)
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created exam: {exam.title}'))
        
        # Create sections
        for section_data in exam_data.get('sections', []):
            section = Section.objects.create(
                exam=exam,
                section_type=section_data['section_type'],
                title=section_data['title'],
                description=section_data.get('description', ''),
                duration=section_data.get('duration', 30),
                order=section_data.get('order', 1),
                is_active=section_data.get('is_active', True)
            )
            
            self.stdout.write(self.style.SUCCESS(f'Created section: {section.title}'))
            
            # Create passages
            for passage_data in section_data.get('passages', []):
                passage = Passage.objects.create(
                    section=section,
                    title=passage_data['title'],
                    content=passage_data['content'],
                    passage_number=passage_data.get('passage_number', 1)
                )
                
                self.stdout.write(self.style.SUCCESS(f'Created passage: {passage.title}'))
                
                # Create questions
                for question_data in passage_data.get('questions', []):
                    question = Question.objects.create(
                        section=section,
                        passage=passage,
                        question_type=question_data['question_type'],
                        question_text=question_data['question_text'],
                        question_number=question_data['question_number'],
                        correct_answer=question_data['correct_answer'],
                        marks=question_data.get('marks', 1),
                        explanation=question_data.get('explanation', ''),
                        audio_timestamp=question_data.get('audio_timestamp')
                    )
                    
                    # Create options for MCQ
                    if question_data['question_type'] == 'MCQ' and 'options' in question_data:
                        for opt_data in question_data['options']:
                            Option.objects.create(
                                question=question,
                                option_label=opt_data['label'],
                                option_text=opt_data['text'],
                                is_correct=opt_data.get('is_correct', False),
                                order=ord(opt_data['label']) - ord('A') + 1
                            )
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created exam: {exam.id}'))


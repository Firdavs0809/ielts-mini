# Run this inside: python manage.py shell

from exam.models import ReadingPassage, Question

# Create or get the reading passage
passage = ReadingPassage.objects.all().first()

# Multiple Choice Questions
mcq_questions = [
    {
        "question_number": 1,
        "question_text": "Necklace-making is considered the most significant cultural tradition for:",
        "option_a": "All Australian Aboriginal people",
        "option_b": "Tasmanian Aboriginal women",
        "option_c": "The French settlers in Tasmania",
        "option_d": "Aboriginal men of the Furneaux Islands",
        "correct_answer": "B",
    },
    {
        "question_number": 2,
        "question_text": "According to the passage, who first began making shell necklaces as a child?",
        "option_a": "Corrie Fullard",
        "option_b": "Aunty Dulcie Greeno",
        "option_c": "Betty Grace",
        "option_d": "Jeanette James",
        "correct_answer": "B",
    },
    {
        "question_number": 3,
        "question_text": "Before European colonisation, shell necklaces were NOT used for:",
        "option_a": "Adornment",
        "option_b": "Exchange for ochre",
        "option_c": "Payment for taxes",
        "option_d": "Gifts and tokens of honour",
        "correct_answer": "C",
    },
    {
        "question_number": 4,
        "question_text": "Which material was introduced after colonisation to clean shells?",
        "option_a": "Penguin oil",
        "option_b": "Muttonbird oil",
        "option_c": "Vinegar",
        "option_d": "Seawater",
        "correct_answer": "C",
    },
    {
        "question_number": 5,
        "question_text": "The maireener shells are preferred when:",
        "option_a": "Found washed up on the beach",
        "option_b": "Picked directly from the sea",
        "option_c": "Bought from local markets",
        "option_d": "Collected after they dry in the sun",
        "correct_answer": "B",
    }
]

for q in mcq_questions:
    Question.objects.create(
        reading_passage=passage,
        question_type="MCQ",
        **q
    )

# True/False/Not Given Questions
tfn_questions = [
    (6, "Shell necklace-making has been interrupted multiple times since European settlement.", "FALSE"),
    (7, "Jacques Labillardière described Tasmanian Aboriginal women wearing blue spiral shells.", "TRUE"),
    (8, "Before colonisation, long necklaces were common among Tasmanian Aboriginal women.", "FALSE"),
    (9, "The National Trust of Australia recognised shell necklaces as a Tasmanian Heritage Icon in 2009.", "TRUE"),
]

for num, text, answer in tfn_questions:
    Question.objects.create(
        reading_passage=passage,
        question_number=num,
        question_text=text,
        question_type="TRUE_FALSE",
        correct_answer=answer
    )

# Short Answer Questions
short_questions = [
    (10, "What type of tool was traditionally used to pierce the shells?", "Jawbone and sharpened tooth of a kangaroo or wallaby"),
    (11, "What type of string was used before synthetic thread was introduced?", "Natural fibres"),
    (12, "Name one reason long necklaces were impractical for a traditional lifestyle.", "They could snag or get damaged during activities like hunting or diving"),
    (13, "Where are shell necklaces often displayed today besides museums and galleries?", "Private collections"),
]

for num, text, answer in short_questions:
    Question.objects.create(
        reading_passage=passage,
        question_number=num,
        question_text=text,
        question_type="TEXT",
        correct_answer=answer
    )

print("✅ All questions inserted successfully!")

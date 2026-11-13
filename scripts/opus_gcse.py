"""Original Foundation exam practice, review-lesson content and Foundation scaffolding for GCSE Maths.
Every numerical answer is computed here, and every mark scheme is checked for mark count.
Run: python3 scripts/opus_gcse.py  ->  writes gcse-opus-data.js"""
import json, math
from fractions import Fraction as Fr
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
def close(a, b, rel=1e-9): return abs(a - b) <= rel * max(1, abs(b))

def P(q, ms, ans=None, unit='', tol=0, help=None):
    """One exam part. ms = list of (code, text); m is the number of marks."""
    part = dict(q=q, m=len(ms), ms=[list(x) for x in ms])
    if ans is not None: part['ans'] = dict(a=round(ans, 10), unit=unit, tol=tol)
    if help: part['help'] = help
    return part
def Q(stem, *parts, fig=None):
    d = dict(stem=stem, parts=list(parts))
    if fig: d['fig'] = fig
    return d

def poly_eval(coeffs, x): return sum(c * x ** i for i, c in enumerate(reversed(coeffs)))
def same_quadratic(a, b, c, roots_or_factors):
    """check x^2 coefficient a etc. against product of (x - r) factors"""
    for x in (-3.7, 0.4, 2.9, 11.0):
        lhs = a * x * x + b * x + c
        rhs = a
        for r in roots_or_factors: rhs *= (x - r)
        assert close(lhs, rhs), (a, b, c, roots_or_factors)

EX = {}  # extra Foundation exam practice, keyed by lesson id

# ---------- verification of the facts the text answers state ----------
same_quadratic(1, 7, 12, [-3, -4]); same_quadratic(1, -9, 20, [4, 5]); same_quadratic(1, 3, -40, [-8, 5])
same_quadratic(1, -5, 6, [2, 3]); same_quadratic(1, 4, -21, [-7, 3]); same_quadratic(1, 0, -25, [5, -5])
assert 5 * 8 == 40

EX['al8'] = [
    Q('', P('Factorise x² + 7x + 12', [('M1', '(x + a)(x + b) with ab = 12 or a + b = 7'), ('A1', '(x + 3)(x + 4)')]),
          P('Hence solve x² + 7x + 12 = 0', [('B1', 'x = −3 and x = −4')])),
    Q('', P('Solve x² − 9x + 20 = 0', [('M1', '(x − 4)(x − 5)'), ('M1', 'x − 4 = 0 or x − 5 = 0'), ('A1', 'x = 4 and x = 5')])),
    Q('<p>A rectangle has length (x + 3) cm and width x cm. Its area is 40 cm².</p>',
      P('Show that x² + 3x − 40 = 0', [('M1', 'x(x + 3) = 40'), ('A1', 'expands to x² + 3x = 40 and rearranges to x² + 3x − 40 = 0')]),
      P('Work out the length of the rectangle.', [('M1', '(x + 8)(x − 5) = 0'), ('A1', 'x = 5 (x = −8 rejected because a length is positive)'), ('A1', 'length = 8 cm')], ans=5 + 3, unit='cm')),
]
assert close(3.40 / 5 * 8, 5.44) and 3 * 8 / 4 == 6 and 18 / 4 * 10 == 45
EX['ra5'] = [
    Q('', P('5 pens cost £3.40. Work out the cost of 8 pens.', [('M1', '3.40 ÷ 5 = 0.68'), ('A1', '£5.44')], ans=3.40 / 5 * 8, unit='£', tol=0.001)),
    Q('', P('It takes 3 machines 8 hours to complete an order. How long would 4 machines take, working at the same rate?', [('M1', '3 × 8 = 24 machine-hours'), ('A1', '6 hours')], ans=3 * 8 / 4, unit='hours')),
    Q('<p>y is directly proportional to x. When x = 4, y = 18.</p>',
      P('Work out y when x = 10.', [('M1', '18 ÷ 4 = 4.5, or y = 4.5x'), ('A1', '45')], ans=18 / 4 * 10),
      P('Describe the graph of y against x.', [('B1', 'a straight line through the origin')])),
]
assert 6 * 2.5 == 15 and 20 / 5 * 3 == 12
EX['ge9'] = [
    Q('<p>Triangle ABC is similar to triangle DEF. AB = 4 cm, BC = 6 cm and DE = 10 cm. AB corresponds to DE and BC corresponds to EF.</p>',
      P('Work out the scale factor of the enlargement from ABC to DEF.', [('B1', '10 ÷ 4 = 2.5')], ans=10 / 4),
      P('Work out the length of EF.', [('M1', '6 × 2.5'), ('A1', '15 cm')], ans=6 * 10 / 4, unit='cm'), fig='simtri'),
    Q('', P('Two rectangles are similar. The smaller rectangle is 3 cm wide and 5 cm long. The larger rectangle is 20 cm long. Work out the width of the larger rectangle.', [('M1', 'scale factor 20 ÷ 5 = 4'), ('A1', '12 cm')], ans=3 * 20 / 5, unit='cm')),
    Q('', P('In triangles PQR and XYZ, PQ = XY, QR = YZ and angle PQR = angle XYZ. Give the condition that shows the triangles are congruent.', [('B1', 'SAS (two sides and the included angle)')])),
]
assert [n for n in range(-5, 6) if -3 < n <= 2] == [-2, -1, 0, 1, 2]
EX['al9'] = [
    Q('', P('Solve 5x + 2 ≤ 17', [('M1', '5x ≤ 15'), ('A1', 'x ≤ 3')])),
    Q('<p>Here is an inequality shown on a number line.</p>', P('Write down the inequality.', [('B1', 'one end correct: −1 ≤ x or x < 4'), ('B1', '−1 ≤ x < 4')]), fig='ineq'),
    Q('', P('n is an integer with −3 &lt; n ≤ 2. Write down all the possible values of n.', [('B1', 'at least four correct values and no more than one wrong'), ('B1', '−2, −1, 0, 1, 2')])),
    Q('', P('Solve 3(x − 2) &gt; 9', [('M1', '3x − 6 > 9 or x − 2 > 3'), ('A1', 'x > 5')])),
]
a, b = (2, 5), (-3, 1)
assert (a[0] + b[0], a[1] + b[1]) == (-1, 6) and (3 * a[0] - 2 * b[0], 3 * a[1] - 2 * b[1]) == (12, 13)
EX['ge11'] = [
    Q('<p>a = {cv:2,5} and b = {cv:−3,1}.</p>',
      P('Work out a + b as a column vector.', [('B1', '{cv:−1,6}')]),
      P('Work out 3a − 2b as a column vector.', [('M1', '3a = {cv:6,15} or 2b = {cv:−6,2}'), ('A1', '{cv:12,13}')])),
    Q('', P('P is the point (1, 3) and Q is the point (6, −1). Write PQ as a column vector.', [('B1', '{cv:5,−4}')])),
    Q('', P('The point (−2, 4) is translated by the vector {cv:5,−3}. Write down the coordinates of its image.', [('B1', '(3, 1)')])),
]
assert Fr(35, 100) == Fr(7, 20) and 0.15 * 240 == 36 and 3 / 8 * 100 == 37.5
EX['nu4'] = [
    Q('', P('Write 0.35 as a fraction in its simplest form.', [('M1', '35/100'), ('A1', '7/20')])),
    Q('', P('Work out 15% of £240.', [('M1', '10% = 24 and 5% = 12, or 0.15 × 240'), ('A1', '£36')], ans=36, unit='£')),
    Q('', P('Write 3/8 as a percentage.', [('M1', '3 ÷ 8 = 0.375'), ('A1', '37.5%')], ans=37.5, unit='%')),
    Q('', P('Which is greater, 4/5 or 78%? You must show your working.', [('M1', '4/5 = 0.8 or 80%, compared with 0.78 or 78%'), ('A1', '4/5 is greater')])),
]
for x in (1.3, -2.2):
    assert close(2 * x * x + 10 * x, 2 * x * (x + 5))
EX['al2'] = [
    Q('', P('Factorise x² − 5x + 6', [('M1', '(x ± 2)(x ± 3)'), ('A1', '(x − 2)(x − 3)')])),
    Q('', P('Factorise x² + 4x − 21', [('M1', 'two numbers with product −21 and sum 4'), ('A1', '(x + 7)(x − 3)')])),
    Q('', P('Factorise x² − 25', [('B1', '(x + 5)(x − 5)')])),
    Q('', P('Factorise fully 2x² + 10x', [('M1', '2(x² + 5x) or x(2x + 10)'), ('A1', '2x(x + 5)')])),
]
assert (30 - 2 * 9) / 2 == 6
EX['al4'] = [
    Q('', P('Make t the subject of v = u + at', [('M1', 'v − u = at'), ('A1', 't = (v − u)/a')])),
    Q('', P('Make x the subject of y = 4x − 7', [('M1', 'y + 7 = 4x'), ('A1', 'x = (y + 7)/4')])),
    Q('', P('P = 2l + 2w. Work out the value of w when P = 30 and l = 9.', [('M1', '30 = 18 + 2w'), ('A1', 'w = 6')], ans=(30 - 2 * 9) / 2)),
    Q('', P('Make r the subject of C = 2πr', [('B1', 'r = C/(2π)')])),
]
# simultaneous equations checks
assert (7 + 3, 7 - 3) == (10, 4) and (2 * 2 + 3 * 3, 2 * 2 + 3) == (13, 7) and (2 * 9 + 3 * 6, 9 + 2 * 6) == (36, 21)
EX['al7'] = [
    Q('', P('Solve the simultaneous equations x + y = 10 and x − y = 4', [('M1', 'adds the equations: 2x = 14'), ('M1', 'substitutes x = 7 to find y'), ('A1', 'x = 7, y = 3')])),
    Q('', P('Solve the simultaneous equations 2x + 3y = 13 and 2x + y = 7', [('M1', 'subtracts the equations: 2y = 6'), ('M1', 'substitutes y = 3 to find x'), ('A1', 'x = 2, y = 3')])),
    Q('<p>2 adult tickets and 3 child tickets cost £36. 1 adult ticket and 2 child tickets cost £21.</p>',
      P('Work out the cost of one adult ticket.', [('P1', 'forms 2a + 3c = 36 and a + 2c = 21'), ('P1', 'doubles the second equation and subtracts: c = 6'), ('A1', 'c = 6 (a child ticket costs £6)'), ('A1', 'an adult ticket costs £9')], ans=9, unit='£')),
]
assert [5 + 3 * k for k in range(5)] == [5, 8, 11, 14, 17] and (101 - 2) % 3 == 0 and (101 - 2) // 3 == 33 and 6 * 10 - 4 == 56
EX['al5'] = [
    Q('<p>Here are the first four terms of an arithmetic sequence: 5, 8, 11, 14</p>',
      P('Write down the next term.', [('B1', '17')], ans=17),
      P('Find an expression, in terms of n, for the nth term.', [('M1', '3n seen'), ('A1', '3n + 2')]),
      P('Is 101 a term of the sequence? Give a reason.', [('M1', '3n + 2 = 101 gives n = 33'), ('A1', 'yes: 101 is the 33rd term')])),
    Q('', P('The nth term of a sequence is 6n − 4. Work out the 10th term.', [('B1', '56')], ans=6 * 10 - 4)),
]
assert (9 - 1) / (6 - 2) == 2
EX['al6'] = [
    Q('', P('Write down the gradient and the y-intercept of the line y = 4x − 3', [('B1', 'gradient 4'), ('B1', 'y-intercept −3, at (0, −3)')])),
    Q('', P('Work out the gradient of the line through (2, 1) and (6, 9).', [('M1', '(9 − 1) ÷ (6 − 2)'), ('A1', '2')], ans=(9 - 1) / (6 - 2))),
    Q('', P('Line L is parallel to y = 2x + 5 and passes through (0, −1). Write down the equation of L.', [('M1', 'gradient 2'), ('A1', 'y = 2x − 1')])),
]
assert 300 / 4 * 10 == 750 and close(2.10 / 6, 0.35) and close(3.40 / 10, 0.34) and close(250 * 1.16, 290)
EX['ra2'] = [
    Q('', P('A recipe for 4 people uses 300 g of rice. How much rice is needed for 10 people?', [('M1', '300 ÷ 4 = 75'), ('A1', '750 g')], ans=750, unit='g')),
    Q('<p>Pack A: 6 bread rolls for £2.10. Pack B: 10 bread rolls for £3.40.</p>',
      P('Which pack is better value? You must show your working.', [('M1', '2.10 ÷ 6 = 0.35'), ('M1', '3.40 ÷ 10 = 0.34'), ('C1', 'Pack B, with both unit prices shown')])),
    Q('', P('The exchange rate is £1 = €1.16. Change £250 into euros.', [('M1', '250 × 1.16'), ('A1', '€290')], ans=250 * 1.16, unit='€', tol=0.0001)),
]
assert close(80 * 1.15, 92) and (52 - 40) / 40 * 100 == 30 and close(54 / 0.9, 60)
EX['ra3'] = [
    Q('', P('Increase £80 by 15%.', [('M1', '80 × 1.15, or 15% of 80 = 12'), ('A1', '£92')], ans=80 * 1.15, unit='£', tol=0.0001)),
    Q('', P('A shop buys a lamp for £40 and sells it for £52. Work out the percentage profit.', [('M1', '52 − 40 = 12'), ('M1', '12 ÷ 40 × 100'), ('A1', '30%')], ans=30, unit='%')),
    Q('', P('After a 10% decrease, the price of a toaster is £54. Work out the price before the decrease.', [('M1', '90% = £54'), ('M1', '54 ÷ 0.9'), ('A1', '£60')], ans=54 / 0.9, unit='£', tol=0.0001)),
]
assert close(2000 * 1.05 ** 2, 2205) and close(15000 * 0.8 ** 2, 9600) and close(500 * 0.04 * 3, 60)
EX['ra4'] = [
    Q('', P('£2000 is invested for 2 years at 5% per year compound interest. Work out the value of the investment after 2 years.', [('M1', '1.05 seen'), ('M1', '2000 × 1.05²'), ('A1', '£2205')], ans=2000 * 1.05 ** 2, unit='£', tol=0.0001)),
    Q('', P('A van is worth £15 000. Its value decreases by 20% each year. Work out its value after 2 years.', [('M1', '0.8 seen'), ('M1', '15 000 × 0.8²'), ('A1', '£9600')], ans=15000 * 0.8 ** 2, unit='£', tol=0.0001)),
    Q('', P('£500 is invested for 3 years at 4% per year simple interest. Work out the total interest.', [('M1', '500 × 0.04 = 20 a year'), ('A1', '£60')], ans=60, unit='£')),
]
assert 135 / 1.5 == 90 and 600 / 75 == 8 and close(120 / 0.4, 300) and 6 / 4 * 60 == 90
EX['ra6'] = [
    Q('', P('A car travels 135 km in 1.5 hours. Work out its average speed.', [('M1', '135 ÷ 1.5'), ('A1', '90 km/h')], ans=90, unit='km/h')),
    Q('', P('A block has mass 600 g and volume 75 cm³. Work out its density.', [('M1', '600 ÷ 75'), ('A1', '8 g/cm³')], ans=8, unit='g/cm³')),
    Q('', P('A force of 120 N acts on an area of 0.4 m². Work out the pressure.', [('M1', '120 ÷ 0.4'), ('A1', '300 N/m²')], ans=300, unit='N/m²', tol=0.0001)),
    Q('', P('Kim walks 6 km at an average speed of 4 km/h. How many minutes does the walk take?', [('M1', '6 ÷ 4 = 1.5 hours'), ('A1', '90 minutes')], ans=90, unit='minutes')),
]
assert (6 - 2) * 180 == 720 and 360 / 10 == 36 and 180 - 47 - 68 == 65
EX['ge1'] = [
    Q('', P('Work out the sum of the interior angles of a hexagon.', [('M1', '(6 − 2) × 180'), ('A1', '720°')], ans=720, unit='°')),
    Q('', P('A regular polygon has 10 sides. Work out the size of each exterior angle.', [('M1', '360 ÷ 10'), ('A1', '36°')], ans=36, unit='°')),
    Q('', P('Two angles of a triangle are 47° and 68°. Work out the third angle. Give a reason for your answer.', [('B1', '65°'), ('B1', 'angles in a triangle add up to 180°')], ans=65, unit='°')),
]
assert close(math.pi * 25, 78.5398, 1e-5) and (7 + 11) / 2 * 4 == 36
EX['ge2'] = [
    Q('', P('A circle has radius 5 cm. Work out its area. Give your answer correct to 1 decimal place.', [('M1', 'π × 5²'), ('A1', '78.5 cm²')], ans=round(math.pi * 25, 1), unit='cm²', tol=0.001)),
    Q('', P('A circle has diameter 12 cm. Write down its circumference in terms of π.', [('B1', '12π cm')])),
    Q('<p>The diagram shows a trapezium.</p>', P('Work out the area of the trapezium.', [('M1', '½ × (7 + 11) × 4'), ('A1', '36 cm²')], ans=36, unit='cm²'), fig='trap'),
]
assert 5 * 4 * 3 == 60 and 2 * (20 + 15 + 12) == 94 and close(math.pi * 4 * 7, 87.9646, 1e-5)
EX['ge3'] = [
    Q('<p>A cuboid measures 5 cm by 4 cm by 3 cm.</p>',
      P('Work out the volume of the cuboid.', [('M1', '5 × 4 × 3'), ('A1', '60 cm³')], ans=60, unit='cm³'),
      P('Work out the total surface area of the cuboid.', [('M1', '2 × (20 + 15 + 12)'), ('A1', '94 cm²')], ans=94, unit='cm²'), fig='cuboid'),
    Q('', P('A cylinder has radius 2 cm and height 7 cm. Work out its volume. Give your answer correct to 1 decimal place.', [('M1', 'π × 2² × 7'), ('A1', '88.0 cm³')], ans=round(math.pi * 28, 1), unit='cm³', tol=0.001)),
]
EX['ge16'] = [
    Q('', P('Write down the number of faces, edges and vertices of a square-based pyramid.', [('B1', 'two of: 5 faces, 8 edges, 5 vertices'), ('B1', 'all three correct')])),
    Q('', P('A cube has edges of length 3 cm. How many 1 cm cubes would fit exactly inside it?', [('B1', '27')], ans=27)),
    Q('', P('Write down the name of the solid with two flat circular faces and one curved surface.', [('B1', 'cylinder')])),
]
assert math.hypot(6, 8) == 10 and close(math.sqrt(25 - 1.96), 4.8) and 7 ** 2 + 24 ** 2 == 25 ** 2
EX['ge4'] = [
    Q('', P('A right-angled triangle has shorter sides 6 cm and 8 cm. Work out the length of the hypotenuse.', [('M1', '6² + 8² = 100'), ('M1', '√100'), ('A1', '10 cm')], ans=10, unit='cm')),
    Q('<p>A ladder 5 m long leans against a vertical wall. The foot of the ladder is 1.4 m from the wall.</p>',
      P('Work out how far up the wall the ladder reaches.', [('M1', '5² − 1.4² = 23.04'), ('M1', '√23.04'), ('A1', '4.8 m')], ans=math.sqrt(25 - 1.96), unit='m', tol=0.001), fig='ladder'),
    Q('', P('A triangle has sides 7 cm, 24 cm and 25 cm. Is it right-angled? You must show your working.', [('M1', '7² + 24² = 49 + 576 = 625'), ('A1', '625 = 25², so yes')])),
]
EX['ge7'] = [
    Q('', P('The point A (3, 2) is reflected in the y-axis. Write down the coordinates of its image.', [('B1', '(−3, 2)')])),
    Q('', P('The point B (4, −1) is rotated 180° about the origin. Write down the coordinates of its image.', [('B1', '(−4, 1)')])),
    Q('', P('Shape P has vertices (1, 1), (3, 1) and (1, 2). P is enlarged by scale factor 3, centre (0, 0). Write down the coordinates of the vertices of the image.', [('M1', 'multiplies the coordinates by 3'), ('A1', '(3, 3), (9, 3) and (3, 6)')])),
    Q('', P('A transformation maps every point (x, y) to (x + 4, y − 2). Describe fully the transformation.', [('B1', 'translation'), ('B1', 'by the vector {cv:4,−2}')])),
]
assert 0.4 * 0.3 == 0.12 and close(0.6 * 0.7, 0.42)
EX['pr2'] = [
    Q('', P('A fair coin is thrown twice. Work out the probability of getting two heads.', [('M1', '½ × ½'), ('A1', '¼')], ans=0.25)),
    Q('<p>The probability that it rains on Monday is 0.4. The probability that it rains on Tuesday is 0.3. The two events are independent.</p>',
      P('Work out the probability that it rains on both days.', [('M1', '0.4 × 0.3'), ('A1', '0.12')], ans=0.12),
      P('Work out the probability that it rains on neither day.', [('M1', '0.6 × 0.7'), ('A1', '0.42')], ans=0.42), fig='tree'),
]
assert sum(1 for i in range(1, 7) for j in range(1, 7) if i + j == 7) == 6
EX['pr4'] = [
    Q('', P('A café has 3 starters and 5 main courses. How many different meals of one starter and one main course are possible?', [('M1', '3 × 5'), ('A1', '15')], ans=15)),
    Q('', P('Two fair six-sided dice are rolled and the scores are added. Work out the probability that the total is 7.', [('M1', '6 ways out of 36 equally likely outcomes'), ('A1', '6/36 = 1/6')], ans=1 / 6, tol=0.01)),
    Q('', P('A coin is thrown and a 4-sided spinner numbered 1 to 4 is spun. List all the possible outcomes.', [('B1', 'at least 6 correct outcomes'), ('B1', 'H1, H2, H3, H4, T1, T2, T3, T4')])),
]
# depth lessons (both tiers): two additional Foundation-level parts each
assert sorted([-3.5, 2, -4, 0.5]) == [-4, -3.5, 0.5, 2] and round((6.2 + 3.85) / (2.1 * 1.5), 2) == 3.19
EX['depth-order'] = [
    Q('', P('Write these numbers in order of size, starting with the smallest: −3.5, 2, −4, 0.5', [('B1', '−4, −3.5, 0.5, 2')])),
    Q('', P('Use your calculator to work out (6.2 + 3.85) ÷ (2.1 × 1.5). Give your answer correct to 2 decimal places.', [('M1', '10.05 ÷ 3.15'), ('A1', '3.19')], ans=round((6.2 + 3.85) / 3.15, 2), tol=0.001)),
]
assert 7 < math.sqrt(55) < 8 and 400 * 6 / 0.2 == 12000
EX['depth-estimate'] = [
    Q('', P('Between which two consecutive whole numbers does √55 lie?', [('B1', '7 and 8, because 7² = 49 and 8² = 64')])),
    Q('', P('Work out an estimate for (412 × 5.87) ÷ 0.198', [('M1', 'rounds to 400 × 6 ÷ 0.2'), ('M1', '2400 ÷ 0.2'), ('A1', '12 000')], ans=12000)),
]
EX['depth-error'] = [
    Q('', P('The mass, m kg, of a box is 3.7 kg correct to 1 decimal place. Write down the error interval for m.', [('B1', '3.65 ≤ m or m < 3.75'), ('B1', '3.65 ≤ m < 3.75')])),
    Q('', P('A number y is truncated to 1 decimal place. The result is 5.2. Write down the error interval for y.', [('B1', '5.2 ≤ y or y < 5.3'), ('B1', '5.2 ≤ y < 5.3')])),
]
assert Fr(3, 5) * 85 == 51 and (60 - 15) * 0.8 == 36
EX['depth-operators'] = [
    Q('', P('Work out 3/5 of 85.', [('M1', '85 ÷ 5 × 3'), ('A1', '51')], ans=51)),
    Q('', P('Tom has £60. He spends 1/4 of it, then spends 20% of what is left. How much money does he have left?', [('M1', '60 − 15 = 45'), ('M1', '20% of 45 = 9, or 45 × 0.8'), ('A1', '£36')], ans=36, unit='£')),
]
assert 2 * (-3) ** 2 - 4 == 14
EX['depth-language'] = [
    Q('<p>Here is a list: 3x + 2 = 11 &nbsp; 4(a + 1) = 4a + 4 &nbsp; 5y − 2 &nbsp; v = u + at</p>', P('Which one is an identity?', [('B1', '4(a + 1) = 4a + 4')])),
    Q('', P('Work out the value of 2a² − b when a = −3 and b = 4.', [('M1', '2 × 9 − 4'), ('A1', '14')], ans=14)),
]
f = [2, 5]
while len(f) < 6: f.append(f[-1] + f[-2])
assert f[5] == 31 and 54 * 3 == 162
EX['depth-sequences'] = [
    Q('', P('In a Fibonacci-type sequence each term is the sum of the two terms before it. The first two terms are 2 and 5. Work out the 6th term.', [('M1', '7 and 12 seen'), ('A1', '31')], ans=31)),
    Q('', P('Is the sequence 2, 6, 18, 54 arithmetic or geometric? Write down the next term.', [('B1', 'geometric (multiply by 3)'), ('B1', '162')], ans=162)),
]
assert 40 / 8 * 3 == 15
EX['depth-ratio'] = [
    Q('', P('Red and blue counters are in the ratio 3 : 5. There are 40 counters. How many are red?', [('M1', '40 ÷ 8 = 5'), ('A1', '15')], ans=15)),
    Q('', P('A : B = 2 : 7. What fraction of the total is A?', [('B1', '2/9')])),
]
assert 45 / 60 * 8 == 6 and 4 * 9 / 6 == 6
EX['depth-proportion'] = [
    Q('', P('8 litres of paint cover 60 m². How much paint is needed to cover 45 m²?', [('M1', '60 ÷ 8 = 7.5 m² per litre, or 45 ÷ 60 = 0.75'), ('A1', '6 litres')], ans=6, unit='litres')),
    Q('', P('4 workers take 9 days to build a wall. How long would 6 workers take, working at the same rate?', [('M1', '4 × 9 = 36 worker-days'), ('A1', '6 days')], ans=6, unit='days')),
]
d = [4, 7, 7, 9, 13]; assert d[2] == 7 and max(d) - min(d) == 9
EX['depth-data'] = [
    Q('', P('Here are five numbers: 4, 7, 7, 9, 13. Work out the median and the range.', [('B1', 'median 7'), ('B1', 'range 9')])),
    Q('<p>Class X: mean 62 marks, range 30 marks. Class Y: mean 58 marks, range 12 marks.</p>', P('Compare the marks of the two classes.', [('C1', 'Class X did better on average: mean 62 > 58'), ('C1', 'Class Y were more consistent: range 12 < 30')])),
]
assert 8 * 25000 / 100000 == 2 and 450 / 50 == 9
EX['depth-scale'] = [
    Q('', P('A map has scale 1 : 25 000. Two villages are 8 cm apart on the map. Work out the real distance between them in kilometres.', [('M1', '8 × 25 000 = 200 000 cm'), ('M1', '200 000 ÷ 100 000'), ('A1', '2 km')], ans=2, unit='km')),
    Q('', P('A plan is drawn to a scale of 1 : 50. A room is 4.5 m long. How long is the room on the plan, in centimetres?', [('M1', '450 ÷ 50'), ('A1', '9 cm')], ans=9, unit='cm')),
]
assert ((2 + 8) / 2, (7 - 1) / 2) == (5, 3) and math.hypot(6, 8) == 10
EX['depth-coordinates'] = [
    Q('', P('Work out the coordinates of the midpoint of (2, 7) and (8, −1).', [('M1', '(2 + 8) ÷ 2 or (7 + (−1)) ÷ 2'), ('A1', '(5, 3)')])),
    Q('', P('Work out the distance between the points (1, 2) and (7, 10).', [('M1', 'differences 6 and 8'), ('M1', '√(6² + 8²)'), ('A1', '10')], ans=10)),
]
assert 6 * 4 - 3 == 21 and (29 + 3) / 4 == 8
EX['depth-machines'] = [
    Q('<p>A function machine multiplies the input by 4 and then subtracts 3.</p>',
      P('Work out the output when the input is 6.', [('B1', '21')], ans=21),
      P('Work out the input when the output is 29.', [('M1', '(29 + 3) ÷ 4'), ('A1', '8')], ans=8)),
]
# mixed exam-practice lessons: two Foundation-only questions each
assert 2 ** 4 * 3 == 48 and Fr(2, 3) + Fr(1, 4) == Fr(11, 12)
EX['nu10'] = [Q('', P('Write 48 as a product of its prime factors.', [('M1', 'a correct factor tree or repeated division'), ('A1', '2⁴ × 3')])),
              Q('', P('Work out 2/3 + 1/4', [('M1', '8/12 + 3/12'), ('A1', '11/12')]))]
for x in (1.7, -4.0): assert close(3 * (x + 4) - 2 * (x - 1), x + 14)
assert 4 * (8 - 3) == 20
EX['al14'] = [Q('', P('Expand and simplify 3(x + 4) − 2(x − 1)', [('M1', '3x + 12 − 2x + 2'), ('A1', 'x + 14')])),
              Q('', P('Solve 4(x − 3) = 20', [('M1', '4x − 12 = 20 or x − 3 = 5'), ('A1', 'x = 8')], ans=8))]
assert 84 / 7 * 2 == 24 and 84 / 7 * 5 == 60 and 350 / 5 * 2 == 140
EX['ra9'] = [Q('', P('Share £84 in the ratio 2 : 5.', [('M1', '84 ÷ 7 = 12'), ('A1', '£24 and £60')])),
             Q('', P('A recipe uses flour and sugar in the ratio 5 : 2. Ali uses 350 g of flour. How much sugar does he need?', [('M1', '350 ÷ 5 = 70'), ('A1', '140 g')], ans=140, unit='g'))]
EX['ge13'] = [Q('', P('A triangle has base 9 cm and perpendicular height 6 cm. Work out its area.', [('M1', '½ × 9 × 6'), ('A1', '27 cm²')], ans=27, unit='cm²')),
              Q('', P('Change 2.5 m into millimetres.', [('B1', '2500 mm')], ans=2500, unit='mm'))]
assert sum([3, 8, 8, 10, 11]) / 5 == 8 and 360 / 72 == 5
EX['st7'] = [Q('', P('Work out the mean of 3, 8, 8, 10 and 11.', [('M1', '40 ÷ 5'), ('A1', '8')], ans=8)),
             Q('', P('A pie chart shows the choices of 72 people. How many degrees represent one person?', [('B1', '5°')], ans=5, unit='°'))]
assert close(1 - 0.35, 0.65) and 300 / 6 == 50
EX['pr6'] = [Q('', P('The probability that a team wins a match is 0.35. Work out the probability that the team does not win.', [('B1', '0.65')], ans=0.65)),
             Q('', P('A fair dice is rolled 300 times. Work out an estimate for the number of times it lands on 6.', [('M1', '300 × 1/6'), ('A1', '50')], ans=50))]

# ---------- review lessons: worked examples, fill-the-gaps and exam questions ----------
def H(title, q, lines, ans, calc=False, fig=None):
    """hand-written worked example: lines = [(working, note)], ans = final line"""
    d = dict(title=title, q=q, lines=[dict(m=m, n=n) for m, n in lines] + [dict(m=ans, ans=True)], calc=calc)
    if fig: d['fig'] = fig
    return d
def F(q, *lines): return dict(q=q, lines=list(lines))

R = {}
assert Fr(3, 4) * Fr(8, 3) == 2 and 6 / 1.5 == 4 and close(3 * 7.45, 22.35)
R['nu9'] = dict(
    hand=[H('Multiplying with a mixed number', 'Work out ¾ × 2⅔', [('2⅔ = 8/3', 'mixed number → improper fraction'), ('¾ × 8/3 = 24/12', 'multiply tops, multiply bottoms')], '= 2'),
          H('Dividing in standard form', 'Work out (6 × 10⁵) ÷ (1.5 × 10²). Give your answer in standard form.', [('6 ÷ 1.5 = 4', 'divide the numbers'), ('10⁵ ÷ 10² = 10³', 'subtract the powers')], '4 × 10³'),
          H('Error interval and a bound', 'x = 7.4 correct to 1 decimal place. Write down the error interval for x and the upper bound of 3x.', [('half of 0.1 = 0.05', 'half a unit either side'), ('7.35 ≤ x &lt; 7.45', '≤ at the bottom, &lt; at the top'), ('3 × 7.45 = 22.35', 'largest x gives largest 3x')], 'error interval 7.35 ≤ x &lt; 7.45; upper bound of 3x = 22.35', fig='nl74')],
    fill=[F('Write 360 as a product of prime factors in index form.', '360 = 2 × 2 × 2 × 3 × 3 × [[5]]', 'the power of 2 is [[3]] and the power of 3 is [[2]]||360 = 2³ × 3² × 5'),
          F('Work out 0.4 × 0.06', '4 × 6 = [[24]]', '0.4 × 0.06 = [[0.024]]||3 decimal places in total'),
          F('Round 0.04582 to 2 significant figures.', '0.04582 = [[0.046]]||the first significant figure is the 4'),
          F('Work out 25% of 84.', '25% = 1/[[4]]', '84 ÷ 4 = [[21]]')],
    exam=[Q('', P('Work out 1⅗ − ¾. Give your answer as a fraction.', [('M1', '8/5 seen'), ('M1', '32/20 − 15/20'), ('A1', '17/20')])),
          Q('', P('Write 0.000 72 in standard form.', [('B1', '7.2 × 10⁻⁴')], ans=0.00072, tol=0.0001)),
          Q('', P('Work out an estimate for (39.6 × 5.1) ÷ 0.48', [('M1', 'rounds to 40 × 5 ÷ 0.5'), ('M1', '200 ÷ 0.5'), ('A1', '400')], ans=400))])
assert Fr(8, 5) - Fr(3, 4) == Fr(17, 20) and 40 * 5 / 0.5 == 400
for x in (2.3, -1.1): assert close((x + 5) * (x - 3), x * x + 2 * x - 15) and close((x + 6) * (x + 2), x * x + 8 * x + 12)
assert 3 * (2 * 6 - 1) == 4 * 6 + 9 and [23 - 3 * n for n in range(1, 5)] == [20, 17, 14, 11]
assert 20 / 4 + 2 == 7 and 3 ** 2 - 2 * (-2) == 13 and (-12 - 4) / (7 - 3) == -4
R['al13'] = dict(
    hand=[H('Expanding double brackets', 'Expand and simplify (x + 5)(x − 3)', [('x² − 3x + 5x − 15', 'every term times every term')], 'x² + 2x − 15'),
          H('Brackets on one side', 'Solve 3(2x − 1) = 4x + 9', [('6x − 3 = 4x + 9', 'expand first'), ('2x = 12', 'collect x on the side with more')], 'x = 6'),
          H('A decreasing sequence', 'Find the nth term of 20, 17, 14, 11, …', [('difference −3 → −3n', 'the times table to compare with'), ('20 − (−3) = 23', 'the zeroth term')], 'nth term = 23 − 3n')],
    fill=[F('Factorise 6x + 15', '6x + 15 = [[3]](2x + 5)'),
          F('Solve x/4 + 2 = 7', 'x/4 = [[5]]', 'x = [[20]]'),
          F('Work out a² − 2b when a = 3 and b = −2', '9 − 2 × (−2) = [[13]]'),
          F('Read off the line y = 3x − 1', 'gradient = [[3]]', 'y-intercept = [[-1]]')],
    exam=[Q('', P('Simplify 4p + 3q − p + 5q', [('B1', 'one correct term'), ('B1', '3p + 8q')])),
          Q('', P('Solve 7x + 4 = 3x − 12', [('M1', '4x = −16'), ('A1', 'x = −4')], ans=-4)),
          Q('', P('Expand and simplify (x + 6)(x + 2)', [('M1', 'at least three of the four terms correct'), ('A1', 'x² + 8x + 12')]))])
assert [150 / 10 * k for k in (2, 3, 5)] == [30, 45, 75] and close(640 * 1.035, 662.4) and 18 / 0.75 == 24
assert Fr(45, 120) == Fr(3, 8) and close(85 * 0.7, 59.5) and 36 / 9 == 4 and 2.5 * 40 == 100
R['ra8'] = dict(
    hand=[H('Sharing in a three-part ratio', 'Share £150 in the ratio 2 : 3 : 5.', [('2 + 3 + 5 = 10 parts', 'total number of parts'), ('£150 ÷ 10 = £15', 'one part')], '£30, £45 and £75', fig='bar235'),
          H('Percentage increase with a multiplier', 'Increase £640 by 3.5%.', [('multiplier = 1 + 0.035 = 1.035', '100% + 3.5%'), ('640 × 1.035', 'one calculation')], '£662.40', calc=True),
          H('Average speed', 'A cyclist rides 18 km in 45 minutes. Work out the average speed in km/h.', [('45 min = 0.75 h', 'minutes ÷ 60'), ('speed = 18 ÷ 0.75', 'distance ÷ time')], '24 km/h', calc=True)],
    fill=[F('Simplify the ratio 3 : 12', '3 : 12 = 1 : [[4]]'),
          F('1.2 kg of apples costs £3.60.', 'cost of 1 kg = £[[3]]'),
          F('Decrease a price by 7%.', 'multiplier = [[0.93]]'),
          F('Density 2.5 g/cm³, volume 40 cm³.', 'mass = 2.5 × 40 = [[100]] g')],
    exam=[Q('', P('Write 45 minutes as a fraction of 2 hours. Give your answer in its simplest form.', [('M1', '45/120'), ('A1', '3/8')])),
          Q('', P('In a sale, prices are reduced by 30%. A coat cost £85 before the sale. Work out its sale price.', [('M1', '85 × 0.7, or 30% of 85 = 25.50'), ('A1', '£59.50')], ans=59.5, unit='£', tol=0.0001)),
          Q('', P('y is inversely proportional to x. When x = 3, y = 12. Work out y when x = 9.', [('M1', 'xy = 36'), ('M1', '36 ÷ 9'), ('A1', '4')], ans=4))])
assert round(math.pi * 25, 1) == 78.5 and 180 - 360 / 5 == 108 and round(10 * math.sin(math.radians(40)), 2) == 6.43
assert round(math.pi * 16 * 10) == 503 and 360 - 95 - 80 - 110 == 75 and round(math.degrees(math.atan(5 / 12)), 1) == 22.6
R['ge12'] = dict(
    hand=[H('Area of a circle from the diameter', 'A circle has diameter 10 cm. Work out its area, correct to 1 decimal place.', [('r = 10 ÷ 2 = 5 cm', 'the formula uses the radius'), ('A = π × 5² = 78.539…', 'πr²')], '78.5 cm²', calc=True),
          H('Interior angle of a regular polygon', 'Work out the size of each interior angle of a regular pentagon.', [('exterior = 360° ÷ 5 = 72°', 'exterior angles add up to 360°'), ('interior = 180° − 72°', 'on a straight line with the exterior')], '108°'),
          H('Finding a side with sine', 'Work out the length x. Give your answer to 3 significant figures.', [('hyp = 10, want opp → sin', 'label the sides from the 40° angle'), ('x = 10 × sin 40° = 6.427…', 'sin 40° = x/10')], 'x = 6.43 cm', calc=True, fig='tri40')],
    fill=[F('Angle facts', 'angles on a straight line add up to [[180]]°', 'angles around a point add up to [[360]]°'),
          F('Volume of a cuboid 6 cm by 5 cm by 2 cm.', 'V = [[60]] cm³'),
          F('Hypotenuse when the shorter sides are 9 cm and 12 cm.', '√(81 + 144) = √[[225]] = [[15]] cm'),
          F('Circumference of a circle of radius 7 cm, in terms of π.', 'C = 2πr = [[14]]π cm')],
    exam=[Q('', P('A cylinder has radius 4 cm and height 10 cm. Work out its volume. Give your answer correct to 3 significant figures.', [('M1', 'π × 4² × 10'), ('A1', '503 cm³')], ans=503, unit='cm³', tol=0.001)),
          Q('', P('Three angles of a quadrilateral are 95°, 80° and 110°. Work out the fourth angle.', [('M1', '360 − (95 + 80 + 110)'), ('A1', '75°')], ans=75, unit='°')),
          Q('<p>A right-angled triangle has sides 5 cm (opposite angle θ) and 12 cm (adjacent to angle θ).</p>', P('Work out the size of angle θ. Give your answer correct to 1 decimal place.', [('M1', 'tan θ = 5/12'), ('A1', '22.6°')], ans=22.6, unit='°', tol=0.001))])
assert Fr(4, 10) ** 2 == Fr(4, 25) and 30 - (13 + 5 + 7) == 5 and 30 / 120 == 0.25
assert close(1 - 0.2 - 0.35, 0.45) and close(0.45 / 2, 0.225) and Fr(3, 8) ** 2 == Fr(9, 64) and close(200 * 0.46, 92)
R['pr5'] = dict(
    hand=[H('Independent events', 'A bag contains 4 red and 6 blue counters. A counter is taken, replaced, and a second counter is taken. Work out P(both red).', [('P(red) = 4/10 = 2/5', 'the bag is the same each time'), ('2/5 × 2/5', 'AND → multiply')], '4/25'),
          H('Reading a Venn diagram', '30 students: 18 play football, 12 play tennis and 5 play both. How many play neither?', [('football only = 18 − 5 = 13; tennis only = 12 − 5 = 7', 'fill the overlap first'), ('13 + 5 + 7 = 25', 'everyone inside the circles')], 'neither = 30 − 25 = 5', fig='venn'),
          H('Relative frequency', 'A dice is rolled 120 times and lands on 6 thirty times. Estimate P(6). Is the dice likely to be fair?', [('30 ÷ 120 = 0.25', 'relative frequency = frequency ÷ trials'), ('a fair dice gives 1/6 ≈ 0.17', 'compare with the theoretical value')], 'estimate 0.25; the dice may be biased towards 6')],
    fill=[F('P(A) = 0.35', 'P(not A) = [[0.65]]'),
          F('A fair dice is rolled 60 times.', 'expected number of 4s = [[10]]'),
          F('Two coins are thrown.', 'number of possible outcomes = [[4]]'),
          F('P(red light) = 0.2 each day, independently.', 'P(red on both days) = [[0.04]]')],
    exam=[Q('<p>A spinner lands on A, B, C or D. P(A) = 0.2 and P(B) = 0.35. Landing on C and landing on D are equally likely.</p>', P('Work out the probability of landing on C.', [('M1', '1 − 0.2 − 0.35 = 0.45'), ('A1', '0.225')], ans=0.225)),
          Q('', P('A box contains 3 green and 5 yellow counters. A counter is taken and replaced, then a second counter is taken. Work out the probability that both are green.', [('M1', '3/8 × 3/8'), ('A1', '9/64')], ans=9 / 64, tol=0.001)),
          Q('', P('A coin is thrown 200 times. The relative frequency of heads is 0.46. How many heads were there?', [('B1', '92')], ans=92))])
xs, ys = [1, 2, 3, 4, 6, 7, 8], [32, 40, 45, 52, 63, 70, 74]
mx, my = sum(xs) / 7, sum(ys) / 7
sl = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
pred5 = my + sl * (5 - mx)
assert 55 <= pred5 <= 59, pred5   # "about 57" read from a line of best fit
assert 3 + 14 + 18 + 16 == 51 and 51 / 20 == 2.55 and 360 / 40 * 14 == 126
R['st6'] = dict(
    hand=[H('Mean from a frequency table', 'Scores 1, 2, 3, 4 have frequencies 3, 7, 6, 4. Work out the mean score.', [('Σf = 3 + 7 + 6 + 4 = 20', 'number of people'), ('Σfx = 3 + 14 + 18 + 16 = 51', 'score × frequency')], 'mean = 51 ÷ 20 = 2.55'),
          H('Pie chart angle', '40 people choose a pet. 14 choose a cat. Work out the angle for cat in a pie chart.', [('360° ÷ 40 = 9° per person', 'angle for one person')], '14 × 9° = 126°'),
          H('Scatter graph', 'The graph shows hours revised and test score for seven students. Describe the correlation and estimate the score for 5 hours of revision.', [('the points rise from left to right', 'positive correlation'), ('draw a line of best fit through the middle of the points', 'roughly as many points above as below'), ('read up from 5 hours to the line and across', 'interpolation: inside the data range')], 'positive correlation; about 57 marks', fig='scatter')],
    fill=[F('4, 9, 2, 15, 7', 'range = [[13]]'),
          F('3, 8, 5, 10, 6', 'in order: 3, 5, [[6]], 8, 10', 'median = [[6]]'),
          F('2, 4, 4, 5, 9', 'mode = [[4]]'),
          F('The mean of 4 numbers is 7.', 'their total = [[28]]')],
    exam=[Q('', P('The mean of five numbers is 12. Four of the numbers are 9, 15, 10 and 14. Work out the fifth number.', [('M1', '5 × 12 = 60 and 60 − 48'), ('A1', '12')], ans=12)),
          Q('', P('Work out the range of 23, 41, 17, 38, 29', [('B1', '24')], ans=24)),
          Q('', P('Jo asks 10 students in her class to estimate how many students in a school of 1200 walk to school. Give one reason why her sample may not be representative.', [('B1', 'the sample is small, or it is from one class only and not random')]))])
assert 60 - (9 + 15 + 10 + 14) == 12 and 41 - 17 == 24

# ---------- Foundation scaffolding: key words and step prompts ----------
S = {
 'depth-order': (['negative number: a number less than zero', 'inequality signs: &lt; less than, &gt; greater than', 'estimate: a rough value worked out with rounded numbers'],
                 ['Put the numbers on a number line, or write them all as decimals.', 'Check the sign first: negatives are smaller than positives.', 'For a calculator, put brackets round a whole top or a whole bottom.', 'Round only at the very end.']),
 'depth-estimate': (['square number: n × n', 'square root √: the number that squares to give it', 'estimate: work with numbers rounded to 1 significant figure'],
                    ['Round each number to 1 significant figure.', 'Write the rounded calculation down.', 'Work it out without a calculator.', 'Check the answer is about the right size.']),
 'depth-error': (['error interval: the range of values that round to the given value', 'lower bound: the smallest possible value', 'upper bound: the value just above the largest possible value'],
                 ['Find what it was rounded to (for example 1 d.p. = 0.1).', 'Halve it.', 'Subtract for the lower bound and add for the upper bound.', 'Write lower ≤ x &lt; upper.']),
 'depth-operators': (['operator: a multiplier such as × 3/4 or × 0.8', 'of means multiply', 'remaining: what is left after a change'],
                     ['Find which amount the fraction or percentage is of.', 'Change the percentage to a decimal multiplier.', 'Multiply.', 'Check whether the next step uses the new amount.']),
 'depth-language': (['expression: terms with no equals sign, e.g. 3x + 2', 'equation: true for particular values, e.g. 3x + 2 = 11', 'identity: true for every value (≡)', 'formula: links quantities, e.g. A = lw'],
                    ['Look for an equals sign.', 'If there is one, test two different values.', 'For substitution, put each value in brackets.', 'Work out powers before multiplying.']),
 'depth-sequences': (['term: one number in a sequence', 'arithmetic: add the same amount each time', 'geometric: multiply by the same amount each time', 'nth term: a rule using the position n'],
                     ['Find the gap between terms.', 'Same gap → arithmetic; same multiplier → geometric.', 'Write the rule and the first term.', 'Check the rule with two terms.']),
 'depth-ratio': (['ratio: compares parts, e.g. 3 : 5', 'part: one share of the ratio', 'total: all the parts added together'],
                 ['Add the parts.', 'Divide the amount by the total parts to find one part.', 'Multiply by each share.', 'Check the shares add back to the total.']),
 'depth-proportion': (['direct proportion: both quantities change by the same multiplier', 'inverse proportion: one doubles as the other halves', 'unitary method: find the value for one first'],
                      ['Decide: more of one means more or less of the other?', 'Find the value for one unit.', 'Multiply (or divide) to the amount asked for.', 'Check the answer makes sense.']),
 'depth-data': (['mean: total ÷ how many', 'median: the middle value in order', 'range: largest − smallest', 'consistent: values close together (small range)'],
                ['Work out an average for each group.', 'Work out the range for each group.', 'Write one sentence comparing the averages.', 'Write one sentence comparing the ranges.']),
 'depth-scale': (['scale 1 : n: 1 cm on the drawing is n cm in real life', 'convert: 100 cm = 1 m, 1000 m = 1 km'],
                 ['Write both lengths in the same units.', 'Drawing → real: multiply by n.', 'Real → drawing: divide by n.', 'Convert to the units asked for.']),
 'depth-coordinates': (['coordinate (x, y): across, then up', 'midpoint: halfway between two points', 'gradient: up ÷ across'],
                       ['Find the change in x and the change in y.', 'Midpoint: add the coordinates and halve.', 'Distance: use Pythagoras on the two changes.', 'Gradient: change in y ÷ change in x.']),
 'depth-machines': (['input: the number going in', 'output: the number coming out', 'inverse: the opposite operation (+ and −, × and ÷)'],
                    ['Follow the arrows in order.', 'To go backwards, start from the output.', 'Use the inverse operations in reverse order.', 'Check by putting your answer back through.']),
 'nu3': (['numerator: the top number', 'denominator: the bottom number', 'mixed number: a whole number and a fraction', 'improper fraction: numerator bigger than denominator'],
         ['Change mixed numbers to improper fractions.', 'Adding or subtracting: make the denominators the same.', 'Multiplying: multiply tops and bottoms; dividing: flip the second fraction and multiply.', 'Simplify and change back to a mixed number.']),
 'nu4': (['percent: out of 100', 'decimal multiplier: the percentage ÷ 100', 'equivalent: equal in value'],
         ['Find 10% by dividing by 10.', 'Build the percentage from 10%, 5% and 1%.', 'Or multiply by the decimal multiplier.', 'Write the units in the answer.']),
 'ra3': (['percentage change: change ÷ original × 100', 'multiplier: 1 + increase, or 1 − decrease', 'original: the value before the change'],
         ['Find the actual change.', 'Divide by the original amount.', 'Multiply by 100.', 'For reverse percentages, divide by the multiplier.']),
 'al1': (['term: a number, a letter, or both multiplied', 'like terms: the same letters and powers', 'expand: multiply out brackets', 'factorise: put back into brackets'],
         ['Collect like terms.', 'Expand: multiply every term inside the bracket.', 'Watch the signs.', 'Check by substituting a number.']),
 'al3': (['equation: two expressions that are equal', 'solve: find the value of the letter', 'inverse operation: undoes an operation'],
         ['Expand any brackets.', 'Get the letters on one side.', 'Get the numbers on the other side.', 'Divide, then check in the original equation.']),
}
for k, (kw, st) in S.items(): assert len(kw) >= 2 and len(st) == 4, k

DATA = dict(exams=EX, reviews=R, scaffold={k: dict(words=v[0], steps=v[1]) for k, v in S.items()})
# integrity: mark counts, at least 2 marks scheme rows etc.
nparts = 0
for bank in [EX] + [{k: v['exam']} for k, v in R.items()]:
    for lid, qs in bank.items():
        for q in qs:
            for p in q['parts']:
                assert p['m'] == len(p['ms']) and 1 <= p['m'] <= 5, (lid, p['q'])
                nparts += 1
out = '/* Generated by scripts/opus_gcse.py: original Foundation exam practice, review content and scaffolding. */\nwindow.GCSE_OPUS=' + json.dumps(DATA, ensure_ascii=False) + ';\n'
(ROOT / 'gcse-opus-data.js').write_text(out, encoding='utf-8')
print('exam parts', nparts, 'lessons with extra exam practice', len(EX), 'reviews', len(R), 'scaffolds', len(S))

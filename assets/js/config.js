/* ------------------------------------------------------------------
   Trip settings — this is the only file you need to edit.
   ------------------------------------------------------------------ */
window.TRIP = {
  /* The moment the holiday begins. ISO 8601 with an explicit UTC offset,
     so the countdown reads the same for everyone, wherever they open it.
     +02:00 = CEST, which is both Poland and Spain in September.
     Change the time when you know the flight: '2026-09-02T06:35:00+02:00' */
  departure: '2026-09-02T00:00:00+02:00',

  /* When you fly home. Set to null if it is not booked yet — the site
     just hides the "nights" line. Example: '2026-09-13T20:00:00+02:00' */
  returnDate: null,

  /* Where the countdown starts filling from, for the progress bar. */
  anchor: '2026-06-01T00:00:00+02:00',

  /* Your name, as it appears in the hero and in the crew section. */
  you: 'Jounes',

  /* Used for the "Add to calendar" file. */
  calendar: {
    title: 'Spain — Valencia',
    location: 'Valencia, Comunitat Valenciana, Spain',
    notes: 'A rented house an hour from Valencia. Jounes, Oliwia, Artur and Paulina.'
  }
};
